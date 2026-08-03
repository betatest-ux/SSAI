<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Strict upload validation shared by the template and document managers.
 * Extension allow-list + finfo MIME verification + container checks for
 * OOXML/zip formats. Files are always stored outside the web root.
 */
final class Uploads
{
    /** ext => [accepted MIME types] (finfo may report zip/octet-stream for OOXML) */
    public const ALLOWED = [
        'pdf'  => ['application/pdf'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream'],
        'pptx' => ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/octet-stream'],
        'odt'  => ['application/vnd.oasis.opendocument.text', 'application/zip'],
        'ods'  => ['application/vnd.oasis.opendocument.spreadsheet', 'application/zip'],
        'odp'  => ['application/vnd.oasis.opendocument.presentation', 'application/zip'],
        'csv'  => ['text/csv', 'text/plain', 'application/csv'],
        'zip'  => ['application/zip'],
        'png'  => ['image/png'],
        'jpg'  => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'webp' => ['image/webp'],
    ];

    /** MIME type to serve per extension. */
    public const SERVE_MIME = [
        'pdf'  => 'application/pdf',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'odt'  => 'application/vnd.oasis.opendocument.text',
        'ods'  => 'application/vnd.oasis.opendocument.spreadsheet',
        'odp'  => 'application/vnd.oasis.opendocument.presentation',
        'csv'  => 'text/csv',
        'zip'  => 'application/zip',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
    ];

    /** Extensions safe to display inline in the browser (everything else downloads). */
    public const INLINE = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];

    /**
     * Validate an entry from $_FILES. Returns [true, ext, serveMime] or [false, errorMessage, null].
     * @return array{0: bool, 1: string, 2: ?string}
     */
    public static function validate(array $file, ?array $allowedExts = null): array
    {
        $err = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($err !== UPLOAD_ERR_OK) {
            return [false, self::errorMessage($err), null];
        }
        if (!is_uploaded_file($file['tmp_name'] ?? '')) {
            return [false, 'Upload failed — please try again.', null];
        }
        $ext = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        $allowed = $allowedExts ?? array_keys(self::ALLOWED);
        if (!isset(self::ALLOWED[$ext]) || !in_array($ext, $allowed, true)) {
            return [false, 'File type .' . ($ext ?: '?') . ' is not allowed. Accepted: ' . implode(', ', $allowed) . '.', null];
        }
        $mime = (string) (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if (!in_array($mime, self::ALLOWED[$ext], true)) {
            return [false, 'The file content does not match its .' . $ext . ' extension (detected ' . $mime . ').', null];
        }
        // OOXML/ODF/zip: confirm the container genuinely opens.
        if (in_array($ext, ['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp', 'zip'], true)) {
            $zip = new \ZipArchive();
            $ok = $zip->open($file['tmp_name']) === true;
            if ($ok && $ext !== 'zip') {
                $ok = $zip->locateName('[Content_Types].xml') !== false || $zip->locateName('mimetype') !== false;
            }
            if ($ok) {
                $zip->close();
            }
            if (!$ok) {
                return [false, 'That file appears corrupted — it could not be opened as a valid .' . $ext . '.', null];
            }
        }
        return [true, $ext, self::SERVE_MIME[$ext]];
    }

    /** Human-readable message for a PHP upload error code. */
    public static function errorMessage(int $code): string
    {
        return match ($code) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE =>
                'The file is larger than the server\'s upload limit (' . self::maxUploadHuman() . '). '
                . 'Raise upload_max_filesize / post_max_size (see DEPLOY.md §"Large uploads") or upload a smaller file.',
            UPLOAD_ERR_PARTIAL => 'The upload was interrupted before it finished — check your connection and try again.',
            UPLOAD_ERR_NO_FILE => 'No file was selected.',
            UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE => 'The server could not store the file (temp dir/permissions) — contact your host.',
            default => 'Upload failed (code ' . $code . ').',
        };
    }

    /** The effective max upload size in bytes (min of the two ini limits). */
    public static function maxUploadBytes(): int
    {
        return min(self::iniBytes('upload_max_filesize'), self::iniBytes('post_max_size'));
    }

    public static function maxUploadHuman(): string
    {
        $b = self::maxUploadBytes();
        return $b >= 1073741824
            ? round($b / 1073741824, 1) . ' GB'
            : ($b >= 1048576 ? round($b / 1048576) . ' MB' : round($b / 1024) . ' KB');
    }

    private static function iniBytes(string $key): int
    {
        $v = trim((string) ini_get($key));
        if ($v === '' || $v === '-1') {
            return PHP_INT_MAX;
        }
        $n = (float) $v;
        return (int) match (strtoupper(substr($v, -1))) {
            'G' => $n * 1073741824,
            'M' => $n * 1048576,
            'K' => $n * 1024,
            default => $n,
        };
    }

    /**
     * Stream a file efficiently with support for HTTP Range requests
     * (resumable downloads, PDF partial loading). Exits when done.
     */
    public static function stream(string $path, string $mime, string $downloadName, bool $inline = false): never
    {
        // Large files must not be limited by script time or buffered in memory.
        @set_time_limit(0);
        ignore_user_abort(false);
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        $size = filesize($path);
        $start = 0;
        $end = $size - 1;
        $status = 200;

        $range = $_SERVER['HTTP_RANGE'] ?? '';
        if ($range && preg_match('/bytes=(\d*)-(\d*)/', $range, $m)) {
            if ($m[1] !== '') {
                $start = (int) $m[1];
                $end = $m[2] !== '' ? min((int) $m[2], $size - 1) : $size - 1;
            } elseif ($m[2] !== '') { // suffix range: last N bytes
                $start = max(0, $size - (int) $m[2]);
            }
            if ($start > $end || $start >= $size) {
                http_response_code(416);
                header("Content-Range: bytes */$size");
                exit;
            }
            $status = 206;
        }

        http_response_code($status);
        header('Content-Type: ' . $mime);
        header('Content-Disposition: ' . ($inline ? 'inline' : 'attachment') . '; filename="' . str_replace('"', '', $downloadName) . '"');
        header('Content-Length: ' . ($end - $start + 1));
        header('Accept-Ranges: bytes');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: private, max-age=0');
        if ($status === 206) {
            header("Content-Range: bytes $start-$end/$size");
        }
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') {
            exit;
        }

        $fp = fopen($path, 'rb');
        fseek($fp, $start);
        $remaining = $end - $start + 1;
        while ($remaining > 0 && !feof($fp) && !connection_aborted()) {
            $chunk = fread($fp, min(1048576, $remaining)); // 1 MB chunks
            if ($chunk === false) {
                break;
            }
            echo $chunk;
            flush();
            $remaining -= strlen($chunk);
        }
        fclose($fp);
        exit;
    }
}
