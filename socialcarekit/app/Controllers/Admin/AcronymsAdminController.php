<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Cache;
use App\Core\Csrf;
use App\Core\DB;

final class AcronymsAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $q = trim((string) ($_GET['q'] ?? ''));
        $params = [];
        $where = '';
        if ($q !== '') {
            $where = 'WHERE acronym LIKE ? OR full_term LIKE ?';
            $params = ["%$q%", "%$q%"];
        }
        $acronyms = DB::all("SELECT * FROM acronyms $where ORDER BY acronym LIMIT 500", $params);
        $editId = (int) ($_GET['edit'] ?? 0);
        $editing = $editId ? DB::one('SELECT * FROM acronyms WHERE id = ?', [$editId]) : null;
        render_admin('admin/acronyms', ['acronyms' => $acronyms, 'q' => $q, 'editing' => $editing], ['title' => 'Acronym manager']);
    }

    public static function save(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        $data = [
            'acronym' => mb_substr(trim((string) ($_POST['acronym'] ?? '')), 0, 40),
            'full_term' => mb_substr(trim((string) ($_POST['full_term'] ?? '')), 0, 255),
            'meaning' => trim((string) ($_POST['meaning'] ?? '')),
            'sector' => in_array($_POST['sector'] ?? '', ['children', 'adults', 'both', 'health', 'education', 'legal'], true)
                ? $_POST['sector'] : 'both',
        ];
        if ($data['acronym'] === '' || $data['full_term'] === '') {
            flash_set('danger', 'Acronym and full term are required.');
            redirect('/admin/acronyms/');
        }
        if ($id) {
            DB::update('acronyms', $data, 'id = ?', [$id]);
            Audit::log('acronym.update', 'acronym', (string) $id, $data['acronym']);
        } else {
            DB::insert('acronyms', $data);
            Audit::log('acronym.create', 'acronym', $data['acronym']);
        }
        Cache::purge();
        flash_set('success', 'Acronym saved.');
        redirect('/admin/acronyms/');
    }

    public static function delete(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        DB::run('DELETE FROM acronyms WHERE id = ?', [$id]);
        Audit::log('acronym.delete', 'acronym', (string) $id);
        Cache::purge();
        flash_set('success', 'Acronym deleted.');
        redirect('/admin/acronyms/');
    }
}
