<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\App;
use App\Core\DB;

final class LibraryController
{
    public static function index(): void
    {
        $templates = DB::all("SELECT * FROM templates WHERE status = 'published' ORDER BY regulator, title");
        render('templates/index', ['templates' => $templates], [
            'title' => 'Template library — free social care templates',
            'description' => 'Free, professionally structured DOCX templates for children\'s homes and adult social care: care plans, MCA assessments, supervision records, Reg 44 packs and more.',
            'breadcrumbs' => [['Home', '/'], ['Templates', null]],
        ]);
    }

    public static function show(string $slug): void
    {
        $t = DB::one("SELECT * FROM templates WHERE slug = ? AND status = 'published'", [$slug]);
        if (!$t) {
            App::notFound();
            return;
        }
        $related = DB::all(
            "SELECT slug, title, regulator FROM templates
             WHERE status = 'published' AND id != ? AND (category = ? OR regulator = ?)
             ORDER BY (category = ?) DESC, RAND() LIMIT 4",
            [$t['id'], $t['category'], $t['regulator'], $t['category']]
        );
        render('templates/show', ['t' => $t, 'related' => $related], [
            'title' => $t['title'] . ' — free template',
            'description' => mb_strimwidth((string) $t['description'], 0, 300, '…'),
            'breadcrumbs' => [['Home', '/'], ['Templates', '/templates/'], [$t['title'], null]],
        ]);
    }

    /** Serve a template file from outside the web root, counting the download. */
    public static function download(string $slug): void
    {
        $t = DB::one("SELECT * FROM templates WHERE slug = ? AND status = 'published'", [$slug]);
        $file = $t ? STORAGE_PATH . '/templates/files/' . basename($t['filename']) : null;
        if (!$t || !is_file($file)) {
            App::notFound();
            return;
        }
        DB::run('UPDATE templates SET download_count = download_count + 1 WHERE id = ?', [$t['id']]);
        DB::run(
            'INSERT INTO download_stats (template_id, day, downloads) VALUES (?, CURDATE(), 1)
             ON DUPLICATE KEY UPDATE downloads = downloads + 1',
            [$t['id']]
        );

        $mime = match ($t['format']) {
            'pdf'  => 'application/pdf',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            default => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        $downloadName = $t['slug'] . '.' . $t['format'];
        header('Content-Type: ' . $mime);
        header('Content-Disposition: attachment; filename="' . $downloadName . '"');
        header('Content-Length: ' . (string) filesize($file));
        header('X-Content-Type-Options: nosniff');
        readfile($file);
        exit;
    }
}
