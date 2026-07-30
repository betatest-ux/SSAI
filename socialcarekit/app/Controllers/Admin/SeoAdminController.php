<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Cache;
use App\Core\Csrf;
use App\Core\DB;
use App\Core\Seo;
use App\Core\Settings;

final class SeoAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $pages = DB::all('SELECT * FROM seo_pages ORDER BY path');
        $editId = (int) ($_GET['edit'] ?? 0);
        $editing = $editId ? DB::one('SELECT * FROM seo_pages WHERE id = ?', [$editId]) : null;
        $robots = @file_get_contents(APP_ROOT . '/public/robots.txt') ?: '';
        render_admin('admin/seo', ['pages' => $pages, 'editing' => $editing, 'robots' => $robots], ['title' => 'SEO manager']);
    }

    public static function save(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $path = '/' . trim((string) ($_POST['path'] ?? ''), '/');
        if ($path !== '/' && !str_contains(basename($path), '.')) {
            $path .= '/';
        }
        $data = [
            'path' => $path,
            'title' => mb_substr(trim((string) ($_POST['title'] ?? '')), 0, 255) ?: null,
            'meta_description' => mb_substr(trim((string) ($_POST['meta_description'] ?? '')), 0, 320) ?: null,
            'canonical' => mb_substr(trim((string) ($_POST['canonical'] ?? '')), 0, 255) ?: null,
            'og_title' => mb_substr(trim((string) ($_POST['og_title'] ?? '')), 0, 255) ?: null,
            'og_description' => mb_substr(trim((string) ($_POST['og_description'] ?? '')), 0, 320) ?: null,
            'og_image' => mb_substr(trim((string) ($_POST['og_image'] ?? '')), 0, 255) ?: null,
        ];
        DB::run(
            'INSERT INTO seo_pages (path, title, meta_description, canonical, og_title, og_description, og_image)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title), meta_description = VALUES(meta_description),
               canonical = VALUES(canonical), og_title = VALUES(og_title), og_description = VALUES(og_description), og_image = VALUES(og_image)',
            array_values($data)
        );
        Audit::log('seo.save', 'seo_page', $path);
        Cache::purge();
        flash_set('success', "SEO overrides saved for $path.");
        redirect('/admin/seo/');
    }

    public static function delete(): void
    {
        Auth::requireLogin();
        Csrf::check();
        DB::run('DELETE FROM seo_pages WHERE id = ?', [(int) ($_POST['id'] ?? 0)]);
        Cache::purge();
        flash_set('success', 'SEO override removed — the page falls back to its built-in metadata.');
        redirect('/admin/seo/');
    }

    // ---- Redirects ----------------------------------------------------------

    public static function redirects(): void
    {
        Auth::requireLogin();
        $redirects = DB::all('SELECT * FROM redirects ORDER BY from_path');
        render_admin('admin/redirects', ['redirects' => $redirects], ['title' => 'Redirect manager']);
    }

    public static function redirectSave(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $from = '/' . ltrim(trim((string) ($_POST['from_path'] ?? '')), '/');
        $to = trim((string) ($_POST['to_path'] ?? ''));
        $code = (int) ($_POST['http_code'] ?? 301) === 302 ? 302 : 301;
        if ($from === '/' || $to === '' || rtrim($from, '/') === rtrim(parse_url($to, PHP_URL_PATH) ?? '', '/')) {
            flash_set('danger', 'A redirect needs a source path (not the homepage) and a different destination.');
            redirect('/admin/redirects/');
        }
        DB::run(
            'INSERT INTO redirects (from_path, to_path, http_code) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE to_path = VALUES(to_path), http_code = VALUES(http_code)',
            [rtrim($from, '/') ?: '/', $to, $code]
        );
        Audit::log('redirect.save', 'redirect', $from, "→ $to ($code)");
        flash_set('success', 'Redirect saved.');
        redirect('/admin/redirects/');
    }

    public static function redirectDelete(): void
    {
        Auth::requireLogin();
        Csrf::check();
        DB::run('DELETE FROM redirects WHERE id = ?', [(int) ($_POST['id'] ?? 0)]);
        flash_set('success', 'Redirect deleted.');
        redirect('/admin/redirects/');
    }

    // ---- robots.txt & sitemap ----------------------------------------------

    public static function robotsSave(): void
    {
        Auth::requireAdmin();
        Csrf::check();
        $content = str_replace("\r\n", "\n", (string) ($_POST['robots'] ?? ''));
        file_put_contents(APP_ROOT . '/public/robots.txt', $content);
        Audit::log('seo.robots_save');
        flash_set('success', 'robots.txt updated.');
        redirect('/admin/seo/');
    }

    public static function sitemapRebuild(): void
    {
        Auth::requireLogin();
        Csrf::check();
        Seo::regenerateSitemap();
        flash_set('success', 'sitemap.xml regenerated.');
        redirect('/admin/seo/');
    }

    public static function healthCheck(string $id): void
    {
        Auth::requireLogin();
        $a = DB::one('SELECT * FROM articles WHERE id = ?', [$id]);
        if (!$a) {
            redirect('/admin/articles/');
        }
        render_admin('admin/seo-check', ['a' => $a, 'checks' => Seo::healthCheck($a)], ['title' => 'SEO check']);
    }
}
