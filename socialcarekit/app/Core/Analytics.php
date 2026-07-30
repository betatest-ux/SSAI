<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Privacy-respecting analytics: aggregate per-day page-view counts only.
 * No cookies, no IP addresses, no user agents stored.
 */
final class Analytics
{
    public static function countView(string $path): void
    {
        try {
            DB::run(
                'INSERT INTO page_views (path, day, views) VALUES (?, CURDATE(), 1)
                 ON DUPLICATE KEY UPDATE views = views + 1',
                [substr($path, 0, 255)]
            );
        } catch (\Throwable) {
            // Analytics must never break a page.
        }
    }

    public static function countSearch(string $query, int $results): void
    {
        $query = mb_strtolower(trim(mb_substr($query, 0, 190)));
        if ($query === '') {
            return;
        }
        try {
            DB::run(
                'INSERT INTO search_queries (query, results_count, searches) VALUES (?, ?, 1)
                 ON DUPLICATE KEY UPDATE searches = searches + 1, results_count = VALUES(results_count), last_searched = NOW()',
                [$query, $results]
            );
        } catch (\Throwable) {
        }
    }

    /** @return array<int, array{path: string, views: int}> */
    public static function topTools(int $limit = 8, int $days = 30): array
    {
        return DB::all(
            "SELECT path, SUM(views) AS views FROM page_views
             WHERE path LIKE '/tools/%' AND day >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
             GROUP BY path ORDER BY views DESC LIMIT " . (int) $limit,
            [$days]
        );
    }

    public static function downloadsThisWeek(): int
    {
        return (int) DB::val(
            'SELECT COALESCE(SUM(downloads), 0) FROM download_stats WHERE day >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
        );
    }
}
