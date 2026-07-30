<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Pure-PHP MySQL dump (no shell access needed on shared hosting) with
 * 14-day rotation for the nightly cron backup.
 */
final class Backup
{
    /** Stream a full SQL dump to the given handle. */
    public static function dump($handle): void
    {
        $pdo = DB::pdo();
        fwrite($handle, "-- SocialCareKit backup " . date('c') . "\nSET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n");
        $tables = $pdo->query('SHOW TABLES')->fetchAll(\PDO::FETCH_COLUMN);
        foreach ($tables as $table) {
            $create = $pdo->query("SHOW CREATE TABLE `$table`")->fetch();
            fwrite($handle, "DROP TABLE IF EXISTS `$table`;\n" . $create['Create Table'] . ";\n\n");
            $stmt = $pdo->query("SELECT * FROM `$table`");
            $rows = [];
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $vals = array_map(
                    fn($v) => $v === null ? 'NULL' : $pdo->quote((string) $v),
                    array_values($row)
                );
                $rows[] = '(' . implode(', ', $vals) . ')';
                if (count($rows) >= 200) {
                    fwrite($handle, "INSERT INTO `$table` VALUES\n" . implode(",\n", $rows) . ";\n");
                    $rows = [];
                }
            }
            if ($rows) {
                fwrite($handle, "INSERT INTO `$table` VALUES\n" . implode(",\n", $rows) . ";\n");
            }
            fwrite($handle, "\n");
        }
        fwrite($handle, "SET FOREIGN_KEY_CHECKS = 1;\n");
    }

    /** Write a dated backup into storage/backups and prune to 14 days. */
    public static function nightly(): string
    {
        $dir = STORAGE_PATH . '/backups';
        if (!is_dir($dir)) {
            mkdir($dir, 0750, true);
        }
        $file = $dir . '/db-' . date('Y-m-d') . '.sql.gz';
        $gz = gzopen($file, 'wb6');
        $tmp = fopen('php://temp', 'w+');
        self::dump($tmp);
        rewind($tmp);
        while (!feof($tmp)) {
            gzwrite($gz, (string) fread($tmp, 65536));
        }
        fclose($tmp);
        gzclose($gz);

        // 14-day rotation.
        foreach (glob($dir . '/db-*.sql.gz') ?: [] as $old) {
            if (filemtime($old) < time() - 14 * 86400) {
                @unlink($old);
            }
        }
        return $file;
    }
}
