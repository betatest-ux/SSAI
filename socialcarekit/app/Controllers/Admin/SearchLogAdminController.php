<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Core\DB;

final class SearchLogAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $top = DB::all('SELECT * FROM search_queries ORDER BY searches DESC, last_searched DESC LIMIT 100');
        $noResults = DB::all('SELECT * FROM search_queries WHERE results_count = 0 ORDER BY searches DESC, last_searched DESC LIMIT 100');
        render_admin('admin/searches', ['top' => $top, 'noResults' => $noResults], ['title' => 'Site searches']);
    }
}
