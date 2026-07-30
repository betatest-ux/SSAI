<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\App;
use App\Core\DB;
use App\Core\Seo;

final class ArticlesController
{
    public static function guidesIndex(): void
    {
        self::listing('guides', 'Practice guides', 'Plain-English guides to the law and frameworks behind everyday social care practice: MCA, quality standards, PACE, record-keeping, inspections and more.');
    }

    public static function rightsIndex(): void
    {
        self::listing('rights', 'Staff rights & career', 'Know where you stand: sleep-in pay, payslips, tax codes, the 48-hour week, grievances, tribunal deadlines and more — explained for care staff.');
    }

    private static function listing(string $section, string $title, string $description): void
    {
        $articles = DB::all(
            "SELECT slug, title, summary, updated_at FROM articles
             WHERE section = ? AND status = 'published' ORDER BY title",
            [$section]
        );
        render('articles/index', ['articles' => $articles, 'section' => $section, 'title' => $title], [
            'title' => $title,
            'description' => $description,
            'breadcrumbs' => [['Home', '/'], [$title, null]],
        ]);
    }

    public static function guide(string $slug): void
    {
        self::article('guides', $slug);
    }

    public static function right(string $slug): void
    {
        self::article('rights', $slug);
    }

    private static function article(string $section, string $slug): void
    {
        $a = DB::one(
            "SELECT * FROM articles WHERE section = ? AND slug = ? AND status = 'published'",
            [$section, $slug]
        );
        if (!$a) {
            App::notFound();
            return;
        }
        $related = DB::all(
            "SELECT slug, section, title FROM articles
             WHERE status = 'published' AND id != ? ORDER BY (section = ?) DESC, RAND() LIMIT 4",
            [$a['id'], $section]
        );
        $sectionTitle = $section === 'guides' ? 'Practice guides' : 'Staff rights & career';
        render('articles/show', ['a' => $a, 'related' => $related, 'sectionTitle' => $sectionTitle], [
            'title' => $a['title'],
            'description' => $a['meta_description'],
            'breadcrumbs' => [['Home', '/'], [$sectionTitle, "/$section/"], [$a['title'], null]],
            'schema' => [Seo::article($a)],
        ]);
    }
}
