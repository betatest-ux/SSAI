<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Csrf;
use App\Core\DB;
use App\Core\Uploads;

final class DocumentsAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $catFilter = (int) ($_GET['category'] ?? 0);
        $q = trim((string) ($_GET['q'] ?? ''));
        $where = [];
        $params = [];
        if ($catFilter) {
            $where[] = 'd.category_id = ?';
            $params[] = $catFilter;
        }
        if ($q !== '') {
            $where[] = '(d.title LIKE ? OR d.original_name LIKE ?)';
            $params[] = "%$q%";
            $params[] = "%$q%";
        }
        $sql = 'SELECT d.*, c.name AS category_name FROM documents d
                LEFT JOIN doc_categories c ON c.id = d.category_id '
            . ($where ? 'WHERE ' . implode(' AND ', $where) : '')
            . ' ORDER BY c.sort_order, c.name, d.title LIMIT 500';
        $documents = DB::all($sql, $params);
        $categories = DB::all('SELECT * FROM doc_categories ORDER BY sort_order, name');
        render_admin('admin/documents', [
            'documents' => $documents,
            'categories' => $categories,
            'catFilter' => $catFilter,
            'q' => $q,
        ], ['title' => 'Documents']);
    }

    public static function form(string $id = ''): void
    {
        Auth::requireLogin();
        $doc = $id !== '' ? DB::one('SELECT * FROM documents WHERE id = ?', [$id]) : null;
        $categories = DB::all('SELECT * FROM doc_categories ORDER BY sort_order, name');
        render_admin('admin/documents-form', ['d' => $doc, 'categories' => $categories], [
            'title' => $doc ? 'Edit document' : 'Upload document',
        ]);
    }

    public static function save(): void
    {
        $user = Auth::requireLogin();

        // A POST bigger than post_max_size arrives with EMPTY $_POST/$_FILES —
        // catch that before the CSRF check would 419 with a confusing message.
        if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
            flash_set('danger', 'That upload exceeded the server\'s POST limit (' . Uploads::maxUploadHuman()
                . '). Raise the limits (DEPLOY.md §"Large uploads") or upload a smaller file.');
            redirect('/admin/documents/new/');
        }
        Csrf::check();

        $id = (int) ($_POST['id'] ?? 0);
        $data = [
            'title' => mb_substr(trim((string) ($_POST['title'] ?? '')), 0, 255),
            'slug' => slugify((string) ($_POST['slug'] ?: $_POST['title'] ?? '')),
            'description' => trim((string) ($_POST['description'] ?? '')) ?: null,
            'category_id' => (int) ($_POST['category_id'] ?? 0) ?: null,
            'status' => ($_POST['status'] ?? '') === 'draft' ? 'draft' : 'published',
        ];
        if ($data['title'] === '' || $data['slug'] === '') {
            flash_set('danger', 'A title is required.');
            redirect($id ? "/admin/documents/$id/" : '/admin/documents/new/');
        }
        if ($data['category_id'] && !DB::val('SELECT id FROM doc_categories WHERE id = ?', [$data['category_id']])) {
            $data['category_id'] = null;
        }

        $hasFile = !empty($_FILES['file']['name']) || (int) ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
        if ($hasFile) {
            [$ok, $extOrError, $mime] = Uploads::validate($_FILES['file']);
            if (!$ok) {
                flash_set('danger', $extOrError);
                redirect($id ? "/admin/documents/$id/" : '/admin/documents/new/');
            }
            $ext = $extOrError;
            $stored = $data['slug'] . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . '.' . $ext;
            $dest = STORAGE_PATH . '/documents/' . $stored;
            if (!is_dir(dirname($dest))) {
                mkdir(dirname($dest), 0755, true);
            }
            if (!move_uploaded_file($_FILES['file']['tmp_name'], $dest)) {
                flash_set('danger', 'The server could not store the file — check storage/documents/ permissions.');
                redirect($id ? "/admin/documents/$id/" : '/admin/documents/new/');
            }
            $data += [
                'stored_name' => $stored,
                'original_name' => preg_replace('/[^\w\-. ()\[\]]/u', '_', (string) $_FILES['file']['name']) ?: ($data['slug'] . '.' . $ext),
                'ext' => $ext,
                'mime' => $mime,
                'filesize' => (int) filesize($dest),
            ];
        }

        try {
            if ($id) {
                $old = DB::one('SELECT stored_name FROM documents WHERE id = ?', [$id]);
                DB::update('documents', $data, 'id = ?', [$id]);
                if ($hasFile && $old && $old['stored_name'] !== $data['stored_name']) {
                    @unlink(STORAGE_PATH . '/documents/' . basename($old['stored_name']));
                }
                Audit::log('document.update', 'document', (string) $id, $data['title']);
            } else {
                if (!$hasFile) {
                    flash_set('danger', 'Choose a file to upload.');
                    redirect('/admin/documents/new/');
                }
                $data['uploaded_by'] = $user['email'];
                $id = DB::insert('documents', $data);
                Audit::log('document.create', 'document', (string) $id, $data['title'] . ' (' . $data['original_name'] . ')');
            }
        } catch (\PDOException $ex) {
            if ((int) $ex->errorInfo[1] === 1062) {
                if ($hasFile) {
                    @unlink(STORAGE_PATH . '/documents/' . ($data['stored_name'] ?? ''));
                }
                flash_set('danger', 'That slug is already used by another document — choose a different one.');
                redirect($id ? "/admin/documents/$id/" : '/admin/documents/new/');
            }
            throw $ex;
        }
        flash_set('success', 'Document saved. Public link: ' . base_url('/files/' . $data['slug'] . '/'));
        redirect("/admin/documents/$id/");
    }

    public static function delete(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        $doc = DB::one('SELECT stored_name, title FROM documents WHERE id = ?', [$id]);
        if ($doc) {
            DB::run('DELETE FROM documents WHERE id = ?', [$id]);
            @unlink(STORAGE_PATH . '/documents/' . basename($doc['stored_name']));
            Audit::log('document.delete', 'document', (string) $id, $doc['title']);
        }
        flash_set('success', 'Document deleted.');
        redirect('/admin/documents/');
    }

    // ---- Categories (sections) ---------------------------------------------

    public static function categories(): void
    {
        Auth::requireLogin();
        $categories = DB::all(
            'SELECT c.*, COUNT(d.id) AS doc_count FROM doc_categories c
             LEFT JOIN documents d ON d.category_id = c.id
             GROUP BY c.id ORDER BY c.sort_order, c.name'
        );
        $editId = (int) ($_GET['edit'] ?? 0);
        $editing = $editId ? DB::one('SELECT * FROM doc_categories WHERE id = ?', [$editId]) : null;
        render_admin('admin/doc-categories', ['categories' => $categories, 'editing' => $editing], ['title' => 'Document categories']);
    }

    public static function categorySave(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        $data = [
            'name' => mb_substr(trim((string) ($_POST['name'] ?? '')), 0, 120),
            'slug' => slugify((string) ($_POST['slug'] ?: $_POST['name'] ?? '')),
            'description' => mb_substr(trim((string) ($_POST['description'] ?? '')), 0, 500) ?: null,
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
        ];
        if ($data['name'] === '' || $data['slug'] === '') {
            flash_set('danger', 'A category name is required.');
            redirect('/admin/documents/categories/');
        }
        try {
            if ($id) {
                DB::update('doc_categories', $data, 'id = ?', [$id]);
                Audit::log('doc_category.update', 'doc_category', (string) $id, $data['name']);
            } else {
                DB::insert('doc_categories', $data);
                Audit::log('doc_category.create', 'doc_category', $data['slug'], $data['name']);
            }
        } catch (\PDOException $ex) {
            if ((int) $ex->errorInfo[1] === 1062) {
                flash_set('danger', 'A category with that slug already exists.');
                redirect('/admin/documents/categories/');
            }
            throw $ex;
        }
        flash_set('success', 'Category saved.');
        redirect('/admin/documents/categories/');
    }

    public static function categoryDelete(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        $count = (int) DB::val('SELECT COUNT(*) FROM documents WHERE category_id = ?', [$id]);
        DB::run('DELETE FROM doc_categories WHERE id = ?', [$id]);
        Audit::log('doc_category.delete', 'doc_category', (string) $id, $count . ' documents now uncategorised');
        flash_set('success', $count
            ? "Category deleted — its $count document(s) are now uncategorised (the files and links still work)."
            : 'Category deleted.');
        redirect('/admin/documents/categories/');
    }
}
