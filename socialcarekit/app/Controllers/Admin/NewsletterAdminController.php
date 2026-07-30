<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\DB;

final class NewsletterAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $stats = DB::all(
            'SELECT list_name,
                    SUM(confirmed_at IS NOT NULL AND unsubscribed_at IS NULL) AS active,
                    SUM(confirmed_at IS NULL AND unsubscribed_at IS NULL) AS pending,
                    SUM(unsubscribed_at IS NOT NULL) AS unsubscribed
             FROM newsletter_subscribers GROUP BY list_name'
        );
        $recent = DB::all('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 50');
        render_admin('admin/newsletter', ['stats' => $stats, 'recent' => $recent], ['title' => 'Newsletter signups']);
    }

    public static function export(): void
    {
        Auth::requireLogin();
        $list = ($_GET['list'] ?? '') === 'storybuilder' ? 'storybuilder' : 'general';
        $rows = DB::all(
            'SELECT email, created_at, confirmed_at FROM newsletter_subscribers
             WHERE list_name = ? AND confirmed_at IS NOT NULL AND unsubscribed_at IS NULL ORDER BY email',
            [$list]
        );
        Audit::log('newsletter.export', 'newsletter', $list, count($rows) . ' addresses');
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="newsletter-' . $list . '-' . date('Y-m-d') . '.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['email', 'signed_up', 'confirmed']);
        foreach ($rows as $r) {
            fputcsv($out, [$r['email'], $r['created_at'], $r['confirmed_at']]);
        }
        fclose($out);
        exit;
    }
}
