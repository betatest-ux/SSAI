<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Analytics;
use App\Core\Auth;
use App\Core\DB;

final class DashboardController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $downloads = Analytics::downloadsThisWeek();
        $topTools = Analytics::topTools(8, 30);
        $viewsWeek = (int) DB::val('SELECT COALESCE(SUM(views),0) FROM page_views WHERE day >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
        $newMessages = (int) DB::val("SELECT COUNT(*) FROM contact_messages WHERE status = 'new'");
        $dueReview = (int) DB::val('SELECT COUNT(*) FROM articles WHERE review_due IS NOT NULL AND review_due <= CURDATE()')
            + (int) DB::val('SELECT COUNT(*) FROM templates WHERE review_due IS NOT NULL AND review_due <= CURDATE()');
        $noResults = DB::all('SELECT query, searches FROM search_queries WHERE results_count = 0 ORDER BY searches DESC, last_searched DESC LIMIT 5');
        $topDownloads = DB::all(
            'SELECT t.title, t.slug, SUM(d.downloads) AS n FROM download_stats d JOIN templates t ON t.id = d.template_id
             WHERE d.day >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY t.id ORDER BY n DESC LIMIT 5'
        );
        render_admin('admin/dashboard', compact('downloads', 'topTools', 'viewsWeek', 'newMessages', 'dueReview', 'noResults', 'topDownloads'), ['title' => 'Dashboard']);
    }

    public static function reviewQueue(): void
    {
        Auth::requireLogin();
        $articles = DB::all('SELECT id, slug, section, title, review_due, status FROM articles WHERE review_due IS NOT NULL AND review_due <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY review_due');
        $templates = DB::all('SELECT id, slug, title, review_due, status FROM templates WHERE review_due IS NOT NULL AND review_due <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY review_due');
        $staleRates = DB::all(
            'SELECT band, label, MAX(effective_from) AS latest FROM nmw_rates GROUP BY band, label
             HAVING latest < DATE_SUB(CURDATE(), INTERVAL 13 MONTH)'
        );
        render_admin('admin/review-queue', compact('articles', 'templates', 'staleRates'), ['title' => 'Review queue']);
    }
}
