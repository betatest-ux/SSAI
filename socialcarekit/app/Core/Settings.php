<?php
declare(strict_types=1);

namespace App\Core;

final class Settings
{
    /** @var array<string, mixed>|null */
    private static ?array $cache = null;

    private static function load(): void
    {
        if (self::$cache !== null) {
            return;
        }
        self::$cache = [];
        try {
            foreach (DB::all('SELECT setting_key, setting_value FROM settings') as $row) {
                self::$cache[$row['setting_key']] = $row['setting_value'];
            }
        } catch (\Throwable) {
            // DB not ready (setup) — behave as empty.
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        self::load();
        return self::$cache[$key] ?? $default;
    }

    public static function json(string $key, mixed $default = null): mixed
    {
        $raw = self::get($key);
        if ($raw === null) {
            return $default;
        }
        $decoded = json_decode((string) $raw, true);
        return $decoded ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        $stored = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        DB::run(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
            [$key, $stored]
        );
        self::$cache[$key] = $stored;
    }
}
