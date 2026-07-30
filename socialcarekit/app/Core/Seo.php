<?php
declare(strict_types=1);

namespace App\Core;

final class Seo
{
    /**
     * Merge page-supplied meta with any admin SEO overrides for this path.
     * @param array<string, mixed> $meta
     * @return array<string, mixed>
     */
    public static function merge(array $meta): array
    {
        $path = request_path();
        $meta += [
            'title'       => config('site_name', 'SocialCareKit'),
            'description' => '',
            'canonical'   => base_url($path),
            'robots'      => null,
            'schema'      => [],
            'breadcrumbs' => [],
            'og_image'    => null,
            'body_class'  => '',
            'extra_head'  => '',
        ];

        try {
            $row = DB::one('SELECT * FROM seo_pages WHERE path = ?', [$path]);
            if ($row) {
                foreach (['title', 'canonical'] as $k) {
                    if (!empty($row[$k])) {
                        $meta[$k] = $row[$k];
                    }
                }
                if (!empty($row['meta_description'])) {
                    $meta['description'] = $row['meta_description'];
                }
                if (!empty($row['og_image'])) {
                    $meta['og_image'] = $row['og_image'];
                }
                if (!empty($row['og_title'])) {
                    $meta['og_title'] = $row['og_title'];
                }
                if (!empty($row['og_description'])) {
                    $meta['og_description'] = $row['og_description'];
                }
            }
        } catch (\Throwable) {
            // pre-install
        }

        // BreadcrumbList schema from breadcrumbs.
        if (!empty($meta['breadcrumbs'])) {
            $items = [];
            $pos = 1;
            foreach ($meta['breadcrumbs'] as [$label, $url]) {
                $items[] = [
                    '@type' => 'ListItem',
                    'position' => $pos++,
                    'name' => $label,
                    'item' => $url ? base_url($url) : null,
                ];
            }
            $meta['schema'][] = ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $items];
        }
        return $meta;
    }

    /** Build FAQPage schema from [['q'=>..,'a'=>..],..] */
    public static function faq(array $pairs): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn($p) => [
                '@type' => 'Question',
                'name' => $p['q'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $p['a']],
            ], $pairs),
        ];
    }

    public static function article(array $a): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $a['title'],
            'description' => $a['meta_description'] ?? '',
            'datePublished' => $a['published_at'] ? date('c', strtotime($a['published_at'])) : null,
            'dateModified' => date('c', strtotime($a['updated_at'])),
            'author' => ['@type' => 'Organization', 'name' => 'SocialCareKit'],
            'publisher' => ['@type' => 'Organization', 'name' => 'SocialCareKit', 'url' => base_url('/')],
            'mainEntityOfPage' => base_url(request_path()),
        ];
    }

    /** Regenerate sitemap.xml in the web root. Called on publish/unpublish. */
    public static function regenerateSitemap(): void
    {
        $urls = [
            ['/', '1.0'], ['/tools/', '0.9'], ['/templates/', '0.9'], ['/guides/', '0.8'],
            ['/rights/', '0.8'], ['/story-builder/', '0.6'], ['/about/', '0.4'], ['/contact/', '0.4'],
        ];
        foreach ([
            'sleep-in-pay-checker', 'holiday-accrual-calculator', 'working-time-checker',
            'notification-decision-tool', 'acronym-decoder', 'body-map', 'visual-timer', 'training-matrix',
        ] as $tool) {
            $urls[] = ["/tools/$tool/", '0.8'];
        }
        try {
            foreach (DB::all("SELECT section, slug, updated_at FROM articles WHERE status = 'published'") as $a) {
                $urls[] = ['/' . $a['section'] . '/' . $a['slug'] . '/', '0.7', $a['updated_at']];
            }
            foreach (DB::all("SELECT slug, updated_at FROM templates WHERE status = 'published'") as $t) {
                $urls[] = ['/templates/' . $t['slug'] . '/', '0.7', $t['updated_at']];
            }
        } catch (\Throwable) {
        }
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
        foreach ($urls as $u) {
            $xml .= '  <url><loc>' . e(base_url($u[0])) . '</loc>';
            if (isset($u[2])) {
                $xml .= '<lastmod>' . date('Y-m-d', strtotime($u[2])) . '</lastmod>';
            }
            $xml .= '<priority>' . $u[1] . "</priority></url>\n";
        }
        $xml .= '</urlset>';
        @file_put_contents(APP_ROOT . '/public/sitemap.xml', $xml);
    }

    /** Simple per-article SEO health check used by the admin panel. */
    public static function healthCheck(array $article): array
    {
        $checks = [];
        $titleLen = mb_strlen($article['title'] ?? '');
        $checks[] = ['Title length 30–60 chars', $titleLen >= 30 && $titleLen <= 60, "Currently $titleLen"];
        $metaLen = mb_strlen($article['meta_description'] ?? '');
        $checks[] = ['Meta description 120–160 chars', $metaLen >= 120 && $metaLen <= 160, "Currently $metaLen"];
        $body = $article['body_html'] ?? '';
        $h1s = preg_match_all('/<h1[\s>]/i', $body);
        $checks[] = ['No H1 in body (page adds its own)', $h1s === 0, "$h1s found"];
        $imgs = preg_match_all('/<img\b[^>]*>/i', $body, $m);
        $missingAlt = 0;
        foreach ($m[0] ?? [] as $img) {
            if (!preg_match('/alt\s*=\s*"[^"]+"/i', $img)) {
                $missingAlt++;
            }
        }
        $checks[] = ['All images have alt text', $missingAlt === 0, $imgs ? "$missingAlt of $imgs missing" : 'No images'];
        $links = preg_match_all('/<a\s+[^>]*href\s*=\s*"\/(?!\/)/i', $body);
        $checks[] = ['At least 2 internal links', $links >= 2, "$links found"];
        return $checks;
    }
}
