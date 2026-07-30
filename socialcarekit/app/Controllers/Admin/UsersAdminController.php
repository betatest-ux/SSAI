<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Csrf;
use App\Core\DB;
use App\Core\Totp;

final class UsersAdminController
{
    public static function index(): void
    {
        Auth::requireAdmin();
        $users = DB::all('SELECT id, email, name, role, totp_secret IS NOT NULL AS has_2fa, last_login_at, created_at FROM admin_users ORDER BY name');
        $editId = (int) ($_GET['edit'] ?? 0);
        $editing = $editId ? DB::one('SELECT id, email, name, role FROM admin_users WHERE id = ?', [$editId]) : null;
        render_admin('admin/users', ['users' => $users, 'editing' => $editing], ['title' => 'User management']);
    }

    public static function save(): void
    {
        $me = Auth::requireAdmin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        $email = mb_strtolower((string) filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL));
        $name = trim((string) ($_POST['name'] ?? ''));
        $role = ($_POST['role'] ?? '') === 'admin' ? 'admin' : 'editor';
        $pass = (string) ($_POST['password'] ?? '');
        if (!$email || $name === '') {
            flash_set('danger', 'A valid email and a name are required.');
            redirect('/admin/users/');
        }
        if ($id) {
            if ($id === (int) $me['id'] && $role !== 'admin') {
                flash_set('danger', 'You cannot demote your own account.');
                redirect('/admin/users/');
            }
            $data = ['email' => $email, 'name' => $name, 'role' => $role];
            if ($pass !== '') {
                if (strlen($pass) < 12) {
                    flash_set('danger', 'Passwords must be at least 12 characters.');
                    redirect('/admin/users/?edit=' . $id);
                }
                $data['password_hash'] = password_hash($pass, PASSWORD_DEFAULT);
            }
            DB::update('admin_users', $data, 'id = ?', [$id]);
            Audit::log('user.update', 'admin_user', (string) $id, "$email ($role)");
        } else {
            if (strlen($pass) < 12) {
                flash_set('danger', 'New accounts need a password of at least 12 characters.');
                redirect('/admin/users/');
            }
            $id = DB::insert('admin_users', [
                'email' => $email, 'name' => $name, 'role' => $role,
                'password_hash' => password_hash($pass, PASSWORD_DEFAULT),
            ]);
            Audit::log('user.create', 'admin_user', (string) $id, "$email ($role)");
        }
        flash_set('success', 'User saved.');
        redirect('/admin/users/');
    }

    public static function delete(): void
    {
        $me = Auth::requireAdmin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        if ($id === (int) $me['id']) {
            flash_set('danger', 'You cannot delete your own account.');
            redirect('/admin/users/');
        }
        DB::run('DELETE FROM admin_users WHERE id = ?', [$id]);
        Audit::log('user.delete', 'admin_user', (string) $id);
        flash_set('success', 'User deleted.');
        redirect('/admin/users/');
    }

    // ---- Two-factor (for the logged-in user's own account) ------------------

    public static function twoFactorSetup(): void
    {
        $me = Auth::requireLogin();
        Auth::start();
        if (empty($_SESSION['totp_setup_secret'])) {
            $_SESSION['totp_setup_secret'] = Totp::generateSecret();
        }
        $secret = $_SESSION['totp_setup_secret'];
        render_admin('admin/2fa-setup', [
            'me' => $me,
            'secret' => $secret,
            'uri' => Totp::uri($secret, $me['email']),
        ], ['title' => 'Two-factor authentication']);
    }

    public static function twoFactorEnable(): void
    {
        $me = Auth::requireLogin();
        Csrf::check();
        Auth::start();
        $secret = (string) ($_SESSION['totp_setup_secret'] ?? '');
        if ($secret === '' || !Totp::verify($secret, (string) ($_POST['code'] ?? ''))) {
            flash_set('danger', 'Code not recognised — scan the secret again and enter the current code.');
            redirect('/admin/users/2fa/');
        }
        DB::update('admin_users', ['totp_secret' => $secret], 'id = ?', [$me['id']]);
        unset($_SESSION['totp_setup_secret']);
        Audit::log('user.2fa_enable', 'admin_user', (string) $me['id']);
        flash_set('success', 'Two-factor authentication enabled for your account.');
        redirect('/admin/users/2fa/');
    }

    public static function twoFactorDisable(): void
    {
        $me = Auth::requireLogin();
        Csrf::check();
        DB::update('admin_users', ['totp_secret' => null], 'id = ?', [$me['id']]);
        Audit::log('user.2fa_disable', 'admin_user', (string) $me['id']);
        flash_set('success', 'Two-factor authentication disabled.');
        redirect('/admin/users/2fa/');
    }

    public static function audit(): void
    {
        Auth::requireAdmin();
        $log = DB::all('SELECT * FROM audit_log ORDER BY id DESC LIMIT 300');
        render_admin('admin/audit', ['log' => $log], ['title' => 'Audit log']);
    }
}
