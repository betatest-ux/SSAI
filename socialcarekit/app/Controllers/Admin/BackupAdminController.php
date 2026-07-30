<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Backup;
use App\Core\Cache;
use App\Core\Csrf;

final class BackupAdminController
{
    public static function index(): void
    {
        Auth::requireAdmin();
        $backups = [];
        foreach (glob(STORAGE_PATH . '/backups/db-*.sql.gz') ?: [] as $f) {
            $backups[] = ['name' => basename($f), 'size' => filesize($f), 'time' => filemtime($f)];
        }
        usort($backups, fn($a, $b) => $b['time'] <=> $a['time']);
        $cacheCount = count(glob(STORAGE_PATH . '/cache/pages/*.html') ?: []);
        render_admin('admin/backup', ['backups' => $backups, 'cacheCount' => $cacheCount], ['title' => 'Backup & maintenance']);
    }

    /** One-click full database export, streamed as a download. */
    public static function export(): void
    {
        Auth::requireAdmin();
        Csrf::check();
        Audit::log('backup.export');
        header('Content-Type: application/sql');
        header('Content-Disposition: attachment; filename="socialcarekit-' . date('Y-m-d-Hi') . '.sql"');
        $out = fopen('php://output', 'w');
        Backup::dump($out);
        fclose($out);
        exit;
    }

    public static function purgeCache(): void
    {
        Auth::requireAdmin();
        Csrf::check();
        Cache::purge();
        Audit::log('cache.purge');
        flash_set('success', 'Page cache purged.');
        redirect('/admin/backup/');
    }

    /** Admin-only viewer for the PHP error log (tail). */
    public static function logs(): void
    {
        Auth::requireAdmin();
        $file = STORAGE_PATH . '/logs/php-error.log';
        $tail = '';
        if (is_file($file)) {
            $size = filesize($file);
            $fp = fopen($file, 'r');
            if ($size > 64 * 1024) {
                fseek($fp, -64 * 1024, SEEK_END);
            }
            $tail = (string) stream_get_contents($fp);
            fclose($fp);
        }
        render_admin('admin/logs', ['tail' => $tail, 'file' => $file], ['title' => 'Error log']);
    }
}
