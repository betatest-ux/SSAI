<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Analytics;
use App\Core\DB;
use App\Core\Seo;
use App\Core\Settings;

final class PagesController
{
    public static function home(): void
    {
        $hero = Settings::json('hero_copy', [
            'heading' => 'Practical tools for people who do the real work of care',
            'lead'    => 'Free calculators, templates and plain-English guidance for the UK social care workforce — children\'s homes and adult services, Ofsted and CQC.',
        ]);
        $featured = Settings::json('featured_tools', [
            'sleep-in-pay-checker', 'holiday-accrual-calculator', 'notification-decision-tool',
            'acronym-decoder', 'training-matrix', 'body-map',
        ]);
        $tools = ToolsController::catalogue();
        $featuredTools = [];
        foreach ($featured as $slug) {
            if (isset($tools[$slug])) {
                $featuredTools[$slug] = $tools[$slug];
            }
        }

        $guides = DB::all("SELECT slug, title, summary FROM articles WHERE section = 'guides' AND status = 'published' ORDER BY published_at DESC LIMIT 3");
        $templateCount = (int) DB::val("SELECT COUNT(*) FROM templates WHERE status = 'published'");

        render('pages/home', [
            'hero' => $hero,
            'featuredTools' => $featuredTools,
            'guides' => $guides,
            'templateCount' => $templateCount,
        ], [
            'title' => 'SocialCareKit — free tools & templates for the UK social care workforce',
            'description' => 'Free interactive tools, downloadable templates and plain-English guides for children\'s homes and adult social care staff. Sleep-in pay checker, training matrix, body maps and more.',
            'schema' => [
                [
                    '@context' => 'https://schema.org',
                    '@type' => 'Organization',
                    'name' => 'SocialCareKit',
                    'url' => base_url('/'),
                    'logo' => base_url('/assets/img/favicon.svg'),
                ],
                [
                    '@context' => 'https://schema.org',
                    '@type' => 'WebSite',
                    'name' => 'SocialCareKit',
                    'url' => base_url('/'),
                    'potentialAction' => [
                        '@type' => 'SearchAction',
                        'target' => base_url('/search/?q={search_term_string}'),
                        'query-input' => 'required name=search_term_string',
                    ],
                ],
            ],
        ]);
    }

    public static function about(): void
    {
        render('pages/about', [], [
            'title' => 'About SocialCareKit',
            'description' => 'Why SocialCareKit exists: free, practical, plain-English resources built for frontline social care staff and registered managers across the UK.',
            'breadcrumbs' => [['Home', '/'], ['About', null]],
        ]);
    }

    public static function contact(): void
    {
        render('pages/contact', ['sent' => isset($_GET['sent'])], [
            'title' => 'Contact & feedback',
            'description' => 'Contact SocialCareKit with questions, feedback or suggestions for new tools and templates for the social care workforce.',
            'breadcrumbs' => [['Home', '/'], ['Contact', null]],
            'robots' => isset($_GET['sent']) ? 'noindex' : null,
        ]);
    }

    public static function reportError(): void
    {
        render('pages/report-error', [
            'sent' => isset($_GET['sent']),
            'tool' => (string) ($_GET['tool'] ?? ''),
        ], [
            'title' => 'Report an error in a tool',
            'description' => 'Spotted something wrong in one of our tools or templates? Tell us so we can fix it — accuracy matters in compliance tooling.',
            'breadcrumbs' => [['Home', '/'], ['Report an error', null]],
        ]);
    }

    public static function privacy(): void
    {
        render('pages/privacy', [], [
            'title' => 'Privacy policy',
            'description' => 'How SocialCareKit handles data: our interactive tools run entirely in your browser and nothing you type is sent to or stored on our servers.',
            'breadcrumbs' => [['Home', '/'], ['Privacy', null]],
        ]);
    }

    public static function terms(): void
    {
        render('pages/terms', [], [
            'title' => 'Terms of use',
            'description' => 'Terms of use for SocialCareKit tools and templates: free for use within your organisation, no resale, guidance not legal advice.',
            'breadcrumbs' => [['Home', '/'], ['Terms', null]],
        ]);
    }

    public static function disclaimer(): void
    {
        render('pages/disclaimer', [], [
            'title' => 'Disclaimer',
            'description' => 'SocialCareKit provides general guidance, not legal or clinical advice. We are not affiliated with Ofsted, the CQC, or Carol Gray / Social Stories™.',
            'breadcrumbs' => [['Home', '/'], ['Disclaimer', null]],
        ]);
    }

    public static function storyBuilder(): void
    {
        render('pages/story-builder', ['subscribed' => isset($_GET['subscribed'])], [
            'title' => 'Visual Story Builder — coming soon from SocialCareKit',
            'description' => 'A visual story builder for care teams: a template library, variable substitution and print-ready pages. Join the launch list.',
            'breadcrumbs' => [['Home', '/'], ['Story Builder', null]],
            'schema' => [Seo::faq([
                ['q' => 'What is the Visual Story Builder?', 'a' => 'A web app for care teams to build personalised visual stories: pick a template, substitute names, photos and settings, and print a ready-to-use booklet.'],
                ['q' => 'Is this Social Stories™?', 'a' => 'No. The product is not affiliated with or endorsed by Carol Gray or Social Stories™. We use the general term “visual stories” throughout.'],
                ['q' => 'How much will it cost?', 'a' => 'Pricing has not been announced yet. Join the launch list and we will email you when it opens.'],
            ])],
        ]);
    }

    public static function search(): void
    {
        $q = trim((string) ($_GET['q'] ?? ''));
        $results = [];
        if ($q !== '' && mb_strlen($q) >= 2) {
            $like = '%' . $q . '%';
            foreach (DB::all(
                "SELECT slug, section, title, summary FROM articles
                 WHERE status = 'published' AND (MATCH(title, summary, body_html) AGAINST (?) OR title LIKE ?)
                 LIMIT 15",
                [$q, $like]
            ) as $a) {
                $results[] = [
                    'kind' => $a['section'] === 'guides' ? 'Guide' : 'Your rights',
                    'title' => $a['title'],
                    'url' => '/' . $a['section'] . '/' . $a['slug'] . '/',
                    'snippet' => $a['summary'],
                ];
            }
            foreach (DB::all(
                "SELECT slug, title, description FROM templates
                 WHERE status = 'published' AND (MATCH(title, description) AGAINST (?) OR title LIKE ?) LIMIT 10",
                [$q, $like]
            ) as $t) {
                $results[] = ['kind' => 'Template', 'title' => $t['title'], 'url' => '/templates/' . $t['slug'] . '/', 'snippet' => $t['description']];
            }
            foreach (DB::all(
                'SELECT acronym, full_term, meaning FROM acronyms WHERE acronym LIKE ? OR full_term LIKE ? LIMIT 8',
                [$like, $like]
            ) as $ac) {
                $results[] = [
                    'kind' => 'Acronym',
                    'title' => $ac['acronym'] . ' — ' . $ac['full_term'],
                    'url' => '/tools/acronym-decoder/?q=' . rawurlencode($ac['acronym']),
                    'snippet' => $ac['meaning'],
                ];
            }
            foreach (ToolsController::catalogue() as $slug => $tool) {
                if (stripos($tool['title'] . ' ' . $tool['blurb'], $q) !== false) {
                    $results[] = ['kind' => 'Tool', 'title' => $tool['title'], 'url' => "/tools/$slug/", 'snippet' => $tool['blurb']];
                }
            }
            Analytics::countSearch($q, count($results));
        }
        render('pages/search', ['q' => $q, 'results' => $results], [
            'title' => $q !== '' ? 'Search: ' . $q : 'Search',
            'robots' => 'noindex',
            'breadcrumbs' => [['Home', '/'], ['Search', null]],
        ]);
    }

    public static function health(): void
    {
        header('Content-Type: text/plain');
        try {
            DB::val('SELECT 1');
            echo 'ok';
        } catch (\Throwable) {
            http_response_code(500);
            echo 'db-error';
        }
    }
}
