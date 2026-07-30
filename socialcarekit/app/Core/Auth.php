<?php
declare(strict_types=1);

namespace App\Core;

final class Auth
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        session_name('sck_admin');
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'secure'   => !empty($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();

        // Idle expiry.
        $limit = (int) config('session_lifetime_minutes', 60) * 60;
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $limit) {
            self::logout();
            session_start();
        }
        $_SESSION['last_activity'] = time();
    }

    /** @return array<string, mixed>|null */
    public static function user(): ?array
    {
        self::start();
        if (empty($_SESSION['admin_id'])) {
            return null;
        }
        return DB::one('SELECT id, email, name, role, totp_secret FROM admin_users WHERE id = ?', [$_SESSION['admin_id']]);
    }

    public static function requireLogin(): array
    {
        $user = self::user();
        if (!$user || !empty($_SESSION['pending_2fa'])) {
            redirect('/admin/login/');
        }
        return $user;
    }

    public static function requireAdmin(): array
    {
        $user = self::requireLogin();
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            render_admin('admin/forbidden', [], ['title' => 'Not allowed']);
            exit;
        }
        return $user;
    }

    /** @return string 'ok' | 'locked' | 'invalid' | '2fa' */
    public static function attempt(string $email, string $password): string
    {
        $email = mb_strtolower(trim($email));
        $ip = client_ip();
        $window = (int) config('login_lockout_minutes', 15);
        $max = (int) config('login_max_attempts', 5);

        $recent = (int) DB::val(
            'SELECT COUNT(*) FROM login_attempts
             WHERE (email = ? OR ip = ?) AND success = 0 AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)',
            [$email, $ip, $window]
        );
        if ($recent >= $max) {
            return 'locked';
        }

        $user = DB::one('SELECT * FROM admin_users WHERE email = ?', [$email]);
        $ok = $user && password_verify($password, $user['password_hash']);
        DB::insert('login_attempts', ['email' => $email, 'ip' => $ip, 'success' => $ok ? 1 : 0]);
        if (!$ok) {
            return 'invalid';
        }

        self::start();
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $user['id'];

        if (!empty($user['totp_secret'])) {
            $_SESSION['pending_2fa'] = true;
            return '2fa';
        }
        self::finishLogin((int) $user['id']);
        return 'ok';
    }

    public static function verifyTotp(string $code): bool
    {
        $user = self::user();
        if (!$user || empty($user['totp_secret'])) {
            return false;
        }
        if (Totp::verify($user['totp_secret'], $code)) {
            unset($_SESSION['pending_2fa']);
            self::finishLogin((int) $user['id']);
            return true;
        }
        return false;
    }

    private static function finishLogin(int $id): void
    {
        DB::run('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [$id]);
        Audit::log('login', 'admin_user', (string) $id);
    }

    public static function logout(): void
    {
        self::start();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
    }
}
