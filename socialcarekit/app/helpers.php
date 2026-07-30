<?php
declare(strict_types=1);

/** HTML-escape. */
function e(?string $s): string
{
    return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8');
}

function config(string $key, mixed $default = null): mixed
{
    $parts = explode('.', $key);
    $val = APP_CONFIG;
    foreach ($parts as $p) {
        if (!is_array($val) || !array_key_exists($p, $val)) {
            return $default;
        }
        $val = $val[$p];
    }
    return $val;
}

function base_url(string $path = ''): string
{
    return rtrim(config('base_url', ''), '/') . '/' . ltrim($path, '/');
}

/** Current request path, normalised with a trailing slash for directories. */
function request_path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    return rawurldecode($path);
}

function redirect(string $to, int $code = 302): never
{
    header('Location: ' . $to, true, $code);
    exit;
}

function is_post(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

/** Render a view file into a string. */
function view(string $template, array $data = []): string
{
    extract($data, EXTR_SKIP);
    ob_start();
    require APP_ROOT . '/app/views/' . $template . '.php';
    return (string) ob_get_clean();
}

/**
 * Render a page inside the public layout and echo it.
 * $meta: title, description, canonical, robots, schema (array of JSON-LD),
 *        breadcrumbs (array of [label, url]), body_class, extra_head, section
 */
function render(string $template, array $data = [], array $meta = []): void
{
    $meta = App\Core\Seo::merge($meta);
    $content = view($template, $data + ['meta' => $meta]);
    echo view('layouts/base', ['content' => $content, 'meta' => $meta]);
}

function render_admin(string $template, array $data = [], array $meta = []): void
{
    $content = view($template, $data + ['meta' => $meta]);
    echo view('layouts/admin', ['content' => $content, 'meta' => $meta]);
}

/** Format a date for display, e.g. 14 July 2026. */
function format_date(?string $date): string
{
    if (!$date) {
        return '';
    }
    $ts = strtotime($date);
    return $ts ? date('j F Y', $ts) : '';
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-');
}

/** Constant-time HMAC token for signed links (unsubscribe etc.). */
function sign_token(string $data): string
{
    return hash_hmac('sha256', $data, config('app_key', 'insecure'));
}

function verify_token(string $data, string $token): bool
{
    return hash_equals(sign_token($data), $token);
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/** Session flash messages (admin panel). */
function flash_set(string $type, string $message): void
{
    App\Core\Auth::start();
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

/** @return array<int, array{type: string, message: string}> */
function flash_pull(): array
{
    App\Core\Auth::start();
    $msgs = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $msgs;
}
