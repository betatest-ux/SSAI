<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Csrf;
use App\Core\DB;
use App\Core\Mailer;

final class AuthController
{
    public static function loginForm(): void
    {
        Auth::start();
        if (Auth::user() && empty($_SESSION['pending_2fa'])) {
            redirect('/admin/');
        }
        render_admin('admin/login', [], ['title' => 'Log in']);
    }

    public static function login(): void
    {
        Csrf::check();
        $result = Auth::attempt((string) ($_POST['email'] ?? ''), (string) ($_POST['password'] ?? ''));
        match ($result) {
            'ok'      => redirect('/admin/'),
            '2fa'     => redirect('/admin/2fa/'),
            'locked'  => self::fail('Too many failed attempts. Please wait 15 minutes and try again.'),
            default   => self::fail('Email or password not recognised.'),
        };
    }

    private static function fail(string $msg): void
    {
        flash_set('danger', $msg);
        redirect('/admin/login/');
    }

    public static function twoFactorForm(): void
    {
        Auth::start();
        if (empty($_SESSION['pending_2fa'])) {
            redirect('/admin/login/');
        }
        render_admin('admin/2fa', [], ['title' => 'Two-factor check']);
    }

    public static function twoFactor(): void
    {
        Csrf::check();
        if (Auth::verifyTotp((string) ($_POST['code'] ?? ''))) {
            redirect('/admin/');
        }
        flash_set('danger', 'That code wasn\'t right — try again.');
        redirect('/admin/2fa/');
    }

    public static function logout(): void
    {
        Csrf::check();
        Audit::log('logout');
        Auth::logout();
        redirect('/admin/login/');
    }

    public static function forgotForm(): void
    {
        render_admin('admin/forgot', [], ['title' => 'Reset password']);
    }

    public static function forgot(): void
    {
        Csrf::check();
        $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
        if ($email) {
            $user = DB::one('SELECT id FROM admin_users WHERE email = ?', [mb_strtolower($email)]);
            if ($user) {
                $token = bin2hex(random_bytes(24));
                DB::update('admin_users', [
                    'reset_token' => hash('sha256', $token),
                    'reset_expires' => date('Y-m-d H:i:s', time() + 3600),
                ], 'id = ?', [$user['id']]);
                Mailer::send(
                    $email,
                    'Reset your SocialCareKit admin password',
                    "A password reset was requested for your admin account.\n\nReset it here (link valid for 1 hour):\n"
                    . base_url('/admin/reset/?t=' . $token)
                    . "\n\nIf this wasn't you, ignore this email — nothing has changed."
                );
            }
        }
        flash_set('success', 'If that address has an admin account, a reset link is on its way.');
        redirect('/admin/login/');
    }

    public static function resetForm(): void
    {
        render_admin('admin/reset', ['token' => (string) ($_GET['t'] ?? '')], ['title' => 'Choose a new password']);
    }

    public static function reset(): void
    {
        Csrf::check();
        $token = (string) ($_POST['token'] ?? '');
        $pass = (string) ($_POST['password'] ?? '');
        $user = $token !== '' ? DB::one(
            'SELECT id FROM admin_users WHERE reset_token = ? AND reset_expires > NOW()',
            [hash('sha256', $token)]
        ) : null;
        if (!$user || strlen($pass) < 12) {
            flash_set('danger', !$user ? 'That reset link is invalid or has expired.' : 'Password must be at least 12 characters.');
            redirect($user ? '/admin/reset/?t=' . urlencode($token) : '/admin/login/');
        }
        DB::update('admin_users', [
            'password_hash' => password_hash($pass, PASSWORD_DEFAULT),
            'reset_token' => null,
            'reset_expires' => null,
        ], 'id = ?', [$user['id']]);
        Audit::log('password.reset', 'admin_user', (string) $user['id']);
        flash_set('success', 'Password changed — log in with the new one.');
        redirect('/admin/login/');
    }
}
