<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\DB;

final class InboxAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $filter = in_array($_GET['status'] ?? '', ['new', 'read', 'actioned'], true) ? $_GET['status'] : null;
        $params = [];
        $where = '';
        if ($filter) {
            $where = 'WHERE status = ?';
            $params[] = $filter;
        }
        $messages = DB::all("SELECT * FROM contact_messages $where ORDER BY created_at DESC LIMIT 200", $params);
        render_admin('admin/inbox', ['messages' => $messages, 'filter' => $filter], ['title' => 'Inbox']);
    }

    public static function setStatus(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $status = in_array($_POST['status'] ?? '', ['new', 'read', 'actioned'], true) ? $_POST['status'] : 'read';
        DB::update('contact_messages', ['status' => $status], 'id = ?', [(int) ($_POST['id'] ?? 0)]);
        redirect('/admin/inbox/' . (($_POST['filter'] ?? '') !== '' ? '?status=' . $_POST['filter'] : ''));
    }
}
