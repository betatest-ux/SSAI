<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\DB;
use App\Core\Mailer;
use App\Core\SpamGuard;

final class FormsController
{
    public static function contactSubmit(): void
    {
        if (SpamGuard::isSpam()) {
            redirect('/contact/?sent=1'); // silently drop spam
        }
        $message = trim((string) ($_POST['message'] ?? ''));
        if ($message === '') {
            redirect('/contact/');
        }
        DB::insert('contact_messages', [
            'msg_type' => 'contact',
            'name'     => mb_substr(trim((string) ($_POST['name'] ?? '')), 0, 120) ?: null,
            'email'    => filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL) ?: null,
            'subject'  => mb_substr(trim((string) ($_POST['subject'] ?? '')), 0, 255) ?: null,
            'message'  => mb_substr($message, 0, 5000),
        ]);
        self::notifyAdmin('New contact message', $message);
        redirect('/contact/?sent=1');
    }

    public static function reportErrorSubmit(): void
    {
        if (SpamGuard::isSpam()) {
            redirect('/report-error/?sent=1');
        }
        $message = trim((string) ($_POST['message'] ?? ''));
        if ($message === '') {
            redirect('/report-error/');
        }
        DB::insert('contact_messages', [
            'msg_type'  => 'tool_error',
            'email'     => filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL) ?: null,
            'subject'   => 'Error report',
            'tool_page' => mb_substr(trim((string) ($_POST['tool'] ?? '')), 0, 255) ?: null,
            'message'   => mb_substr($message, 0, 5000),
        ]);
        self::notifyAdmin('Tool error report', $message);
        redirect('/report-error/?sent=1');
    }

    private static function notifyAdmin(string $subject, string $body): void
    {
        $to = config('mail.admin_to');
        if ($to) {
            Mailer::send($to, '[SocialCareKit] ' . $subject, mb_substr($body, 0, 2000) . "\n\nView in admin: " . base_url('/admin/inbox/'));
        }
    }

    // ---- Newsletter: double opt-in, signed unsubscribe links (PECR/GDPR) ----

    public static function newsletterSubscribe(): void
    {
        $return = in_array($_POST['return'] ?? '', ['/story-builder/', '/contact/'], true) ? $_POST['return'] : '/contact/';
        if (SpamGuard::isSpam()) {
            redirect($return . '?subscribed=1');
        }
        $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $list = ($_POST['list'] ?? '') === 'storybuilder' ? 'storybuilder' : 'general';
        if (!$email) {
            redirect($return);
        }
        $token = bin2hex(random_bytes(24));
        DB::run(
            'INSERT INTO newsletter_subscribers (email, list_name, confirm_token) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE confirm_token = IF(confirmed_at IS NULL, VALUES(confirm_token), confirm_token), unsubscribed_at = NULL',
            [$email, $list, $token]
        );
        $row = DB::one('SELECT id, confirm_token, confirmed_at FROM newsletter_subscribers WHERE email = ? AND list_name = ?', [$email, $list]);
        if ($row && !$row['confirmed_at']) {
            $confirmUrl = base_url('/newsletter/confirm/?t=' . $row['confirm_token']);
            $listLabel = $list === 'storybuilder' ? 'the Visual Story Builder launch list' : 'the SocialCareKit newsletter';
            Mailer::send(
                $email,
                'Confirm your subscription — SocialCareKit',
                "Hello,\n\nSomeone (hopefully you) asked to join $listLabel.\n\nConfirm your subscription by opening this link:\n$confirmUrl\n\nIf this wasn't you, just ignore this email — you won't be added and no further messages will be sent.\n\nSocialCareKit\n" . base_url('/')
            );
        }
        redirect($return . '?subscribed=1');
    }

    public static function newsletterConfirm(): void
    {
        $token = (string) ($_GET['t'] ?? '');
        $row = $token !== '' ? DB::one('SELECT * FROM newsletter_subscribers WHERE confirm_token = ?', [$token]) : null;
        if ($row && !$row['confirmed_at']) {
            DB::run('UPDATE newsletter_subscribers SET confirmed_at = NOW(), unsubscribed_at = NULL WHERE id = ?', [$row['id']]);
        }
        render('pages/newsletter-status', [
            'ok' => (bool) $row,
            'headline' => $row ? 'Subscription confirmed' : 'Link not recognised',
            'text' => $row
                ? 'You\'re on the list. We only email when there\'s something genuinely worth knowing, and every email has a one-click unsubscribe link.'
                : 'That confirmation link is invalid or has already been used. Try subscribing again.',
        ], ['title' => $row ? 'Subscription confirmed' : 'Link not recognised', 'robots' => 'noindex']);
    }

    public static function newsletterUnsubscribe(): void
    {
        $email = (string) ($_GET['e'] ?? '');
        $sig = (string) ($_GET['s'] ?? '');
        $ok = false;
        if ($email !== '' && verify_token('unsub:' . $email, $sig)) {
            DB::run('UPDATE newsletter_subscribers SET unsubscribed_at = NOW() WHERE email = ?', [$email]);
            $ok = true;
        }
        render('pages/newsletter-status', [
            'ok' => $ok,
            'headline' => $ok ? 'You\'re unsubscribed' : 'Link not recognised',
            'text' => $ok
                ? 'Done — you won\'t receive any more emails from us. No hard feelings.'
                : 'That unsubscribe link is invalid. Contact us and we\'ll remove you manually, no questions asked.',
        ], ['title' => $ok ? 'Unsubscribed' : 'Link not recognised', 'robots' => 'noindex']);
    }
}
