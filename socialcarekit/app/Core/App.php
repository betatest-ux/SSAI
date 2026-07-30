<?php
declare(strict_types=1);

namespace App\Core;

final class App
{
    public static function run(): void
    {
        self::securityHeaders();

        $path = request_path();
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Canonicalise: content URLs end with a trailing slash.
        if ($method === 'GET' && $path !== '/' && !str_contains(basename($path), '.') && !str_ends_with($path, '/')) {
            redirect($path . '/', 301);
        }

        // Admin-managed 301 redirects.
        if ($method === 'GET') {
            self::applyRedirect($path);
        }

        // Maintenance mode (admins still get through to /admin/).
        if (Settings::get('maintenance_mode') === '1' && !str_starts_with($path, '/admin') && $path !== '/health') {
            http_response_code(503);
            header('Retry-After: 3600');
            echo view('pages/maintenance', ['meta' => Seo::merge(['title' => 'Back soon'])]);
            return;
        }

        // Serve cached copy of public GET pages.
        if ($method === 'GET' && Cache::serve($path)) {
            return;
        }

        try {
            $routes = require APP_ROOT . '/app/routes.php';
            $handler = self::match($routes, $method, $path);
            if ($handler === null) {
                self::notFound();
                return;
            }
            [$callable, $params] = $handler;
            ob_start();
            $callable(...$params);
            $output = (string) ob_get_clean();
            echo $output;
            // Cache successful public GET responses.
            if ($method === 'GET' && http_response_code() === 200 && Cache::cacheable($path)) {
                Cache::store($path, $output);
            }
            if ($method === 'GET' && http_response_code() === 200 && !str_starts_with($path, '/admin')) {
                Analytics::countView($path);
            }
        } catch (\PDOException $ex) {
            error_log('DB error: ' . $ex->getMessage());
            http_response_code(500);
            echo view('pages/error', ['meta' => Seo::merge(['title' => 'Something went wrong'])]);
        } catch (\Throwable $ex) {
            error_log($ex->getMessage() . ' @ ' . $ex->getFile() . ':' . $ex->getLine());
            http_response_code(500);
            echo view('pages/error', ['meta' => Seo::merge(['title' => 'Something went wrong'])]);
        }
    }

    /**
     * Match a route table. Keys: "GET /tools/", with {param} placeholders.
     * @return array{0: callable, 1: array<string>}|null
     */
    private static function match(array $routes, string $method, string $path): ?array
    {
        $key = $method . ' ' . $path;
        if (isset($routes[$key])) {
            return [$routes[$key], []];
        }
        foreach ($routes as $pattern => $callable) {
            if (!str_contains($pattern, '{')) {
                continue;
            }
            [$m, $p] = explode(' ', $pattern, 2);
            if ($m !== $method) {
                continue;
            }
            // preg_quote escapes the {param} braces — swap them for a capture group
            $regex = '#^' . preg_replace('/\\\\\{[a-z_]+\\\\\}/', '([a-z0-9\-]+)', preg_quote($p, '#')) . '$#';
            if (preg_match($regex, $path, $matches)) {
                return [$callable, array_slice($matches, 1)];
            }
        }
        return null;
    }

    private static function applyRedirect(string $path): void
    {
        try {
            $row = DB::one('SELECT to_path, http_code, id FROM redirects WHERE from_path = ?', [rtrim($path, '/') ?: '/']);
            if (!$row) {
                $row = DB::one('SELECT to_path, http_code, id FROM redirects WHERE from_path = ?', [$path]);
            }
            if ($row) {
                DB::run('UPDATE redirects SET hits = hits + 1 WHERE id = ?', [$row['id']]);
                redirect($row['to_path'], (int) $row['http_code']);
            }
        } catch (\Throwable) {
            // No DB yet — ignore.
        }
    }

    public static function notFound(): void
    {
        http_response_code(404);
        $popular = [];
        try {
            $popular = Analytics::topTools(5);
        } catch (\Throwable) {
        }
        echo view('pages/404', [
            'popular' => $popular,
            'meta' => Seo::merge(['title' => 'Page not found', 'robots' => 'noindex']),
        ]);
    }

    private static function securityHeaders(): void
    {
        header('X-Frame-Options: SAMEORIGIN');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
    }
}
