<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Simple file-based full-page cache for anonymous GET requests.
 * Purged whenever content is published/edited from the admin panel.
 */
final class Cache
{
    private const TTL = 3600; // 1 hour safety TTL on top of purge-on-publish

    private static function dir(): string
    {
        return STORAGE_PATH . '/cache/pages';
    }

    private static function file(string $path): string
    {
        return self::dir() . '/' . sha1($path) . '.html';
    }

    public static function cacheable(string $path): bool
    {
        if (str_starts_with($path, '/admin') || str_starts_with($path, '/download')) {
            return false;
        }
        // Never cache pages that vary per visitor (forms carry CSRF-free honeypots
        // so they are fine, but search results and confirmation pages are not).
        foreach (['/search', '/newsletter', '/contact', '/health'] as $skip) {
            if (str_starts_with($path, $skip)) {
                return false;
            }
        }
        if (!empty($_GET)) {
            return false;
        }
        if (Settings::get('maintenance_mode') === '1') {
            return false;
        }
        return true;
    }

    /** Try to serve a cached copy. Returns true if served. */
    public static function serve(string $path): bool
    {
        if (!self::cacheable($path)) {
            return false;
        }
        $f = self::file($path);
        if (is_file($f) && (time() - filemtime($f)) < self::TTL) {
            header('X-Cache: hit');
            readfile($f);
            Analytics::countView($path);
            return true;
        }
        return false;
    }

    public static function store(string $path, string $html): void
    {
        if (!is_dir(self::dir())) {
            @mkdir(self::dir(), 0755, true);
        }
        @file_put_contents(self::file($path), $html, LOCK_EX);
    }

    /** Purge the whole page cache (called on any admin content change). */
    public static function purge(): void
    {
        foreach (glob(self::dir() . '/*.html') ?: [] as $f) {
            @unlink($f);
        }
    }
}
