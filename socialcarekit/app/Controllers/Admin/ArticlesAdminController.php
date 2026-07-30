<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Cache;
use App\Core\Csrf;
use App\Core\DB;
use App\Core\Seo;

final class ArticlesAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $articles = DB::all('SELECT id, slug, section, title, status, review_due, updated_at FROM articles ORDER BY section, title');
        render_admin('admin/articles-index', ['articles' => $articles], ['title' => 'Content manager']);
    }

    public static function form(string $id = ''): void
    {
        Auth::requireLogin();
        $article = $id !== '' ? DB::one('SELECT * FROM articles WHERE id = ?', [$id]) : null;
        $seoChecks = $article ? Seo::healthCheck($article) : [];
        render_admin('admin/articles-form', ['a' => $article, 'seoChecks' => $seoChecks], ['title' => $article ? 'Edit article' : 'New article']);
    }

    public static function save(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        $data = [
            'slug' => slugify((string) ($_POST['slug'] ?: $_POST['title'] ?? '')),
            'section' => in_array($_POST['section'] ?? '', ['guides', 'rights'], true) ? $_POST['section'] : 'guides',
            'title' => mb_substr(trim((string) ($_POST['title'] ?? '')), 0, 255),
            'meta_description' => mb_substr(trim((string) ($_POST['meta_description'] ?? '')), 0, 320),
            'summary' => trim((string) ($_POST['summary'] ?? '')),
            'key_legislation' => json_encode(
                array_values(array_filter(array_map('trim', explode("\n", (string) ($_POST['key_legislation'] ?? ''))))),
                JSON_UNESCAPED_UNICODE
            ),
            'body_html' => self::cleanHtml((string) ($_POST['body_html'] ?? '')),
            'status' => ($_POST['status'] ?? '') === 'published' ? 'published' : 'draft',
            'review_due' => $_POST['review_due'] ?: null,
        ];
        if ($data['title'] === '' || $data['slug'] === '') {
            flash_set('danger', 'A title (and slug) is required.');
            redirect($id ? "/admin/articles/$id/" : '/admin/articles/new/');
        }
        try {
            if ($id) {
                if ($data['status'] === 'published' && !DB::val('SELECT published_at FROM articles WHERE id = ?', [$id])) {
                    $data['published_at'] = date('Y-m-d H:i:s');
                }
                DB::update('articles', $data, 'id = ?', [$id]);
                Audit::log('article.update', 'article', (string) $id, $data['title']);
            } else {
                if ($data['status'] === 'published') {
                    $data['published_at'] = date('Y-m-d H:i:s');
                }
                $id = DB::insert('articles', $data);
                Audit::log('article.create', 'article', (string) $id, $data['title']);
            }
        } catch (\PDOException $ex) {
            if ((int) $ex->errorInfo[1] === 1062) {
                flash_set('danger', 'That slug is already used by another article in this section — choose a different one.');
                redirect($id ? "/admin/articles/$id/" : '/admin/articles/new/');
            }
            throw $ex;
        }
        Cache::purge();
        Seo::regenerateSitemap();
        flash_set('success', 'Saved. Page cache purged and sitemap regenerated.');
        redirect("/admin/articles/$id/");
    }

    public static function delete(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        DB::run('DELETE FROM articles WHERE id = ?', [$id]);
        Audit::log('article.delete', 'article', (string) $id);
        Cache::purge();
        Seo::regenerateSitemap();
        flash_set('success', 'Article deleted.');
        redirect('/admin/articles/');
    }

    /** Strip scripts/events from stored HTML (defence in depth for editor content). */
    public static function cleanHtml(string $html): string
    {
        $html = preg_replace('#<\s*(script|style|iframe|object|embed|form)\b[^>]*>.*?<\s*/\s*\1\s*>#is', '', $html) ?? '';
        $html = preg_replace('#<\s*(script|iframe|object|embed)\b[^>]*/?>#i', '', $html) ?? '';
        $html = preg_replace('/\son\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html) ?? '';
        $html = preg_replace('/(href|src)\s*=\s*(["\']?)\s*javascript:[^"\'>\s]*\2/i', '$1="#"', $html) ?? '';
        return trim($html);
    }
}
