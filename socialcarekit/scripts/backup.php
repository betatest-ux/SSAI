<?php
/**
 * Nightly database backup with 14-day rotation.
 * cPanel cron example (run daily at 02:30):
 *   30 2 * * * /usr/local/bin/php /home/USER/socialcarekit/scripts/backup.php
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only.');
}

require dirname(__DIR__) . '/app/bootstrap.php';

$file = App\Core\Backup::nightly();
echo 'Backup written: ' . $file . ' (' . number_format(filesize($file) / 1024) . " KB)\n";
