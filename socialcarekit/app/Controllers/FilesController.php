<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\App;
use App\Core\DB;
use App\Core\Uploads;

/**
 * Public serving of admin-uploaded documents at /files/{slug}/.
 * Files live outside the web root; downloads are counted; PDFs and images
 * display inline (append ?dl=1 to force download), everything else downloads.
 */
final class FilesController
{
    public static function serve(string $slug): void
    {
        $doc = DB::one("SELECT * FROM documents WHERE slug = ? AND status = 'published'", [$slug]);
        $path = $doc ? STORAGE_PATH . '/documents/' . basename($doc['stored_name']) : null;
        if (!$doc || !is_file($path)) {
            App::notFound();
            return;
        }
        // Count full downloads only, not every Range chunk of a streamed PDF.
        if (empty($_SERVER['HTTP_RANGE'])) {
            DB::run('UPDATE documents SET download_count = download_count + 1 WHERE id = ?', [$doc['id']]);
        }
        $inline = in_array($doc['ext'], Uploads::INLINE, true) && !isset($_GET['dl']);
        Uploads::stream($path, $doc['mime'], $doc['original_name'], $inline);
    }
}
