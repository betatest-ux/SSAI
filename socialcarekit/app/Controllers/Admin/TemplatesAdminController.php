<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Cache;
use App\Core\Csrf;
use App\Core\DB;
use App\Core\Seo;

final class TemplatesAdminController
{
    private const ALLOWED = [
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'pdf'  => 'application/pdf',
    ];

    public static function index(): void
    {
        Auth::requireLogin();
        $templates = DB::all('SELECT * FROM templates ORDER BY regulator, title');
        render_admin('admin/templates-index', ['templates' => $templates], ['title' => 'Template manager']);
    }

    public static function form(string $id = ''): void
    {
        Auth::requireLogin();
        $t = $id !== '' ? DB::one('SELECT * FROM templates WHERE id = ?', [$id]) : null;
        render_admin('admin/templates-form', ['t' => $t], ['title' => $t ? 'Edit template' : 'New template']);
    }

    public static function save(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        $data = [
            'slug' => slugify((string) ($_POST['slug'] ?: $_POST['title'] ?? '')),
            'title' => mb_substr(trim((string) ($_POST['title'] ?? '')), 0, 255),
            'description' => trim((string) ($_POST['description'] ?? '')),
            'supports' => mb_substr(trim((string) ($_POST['supports'] ?? '')), 0, 500) ?: null,
            'regulator' => in_array($_POST['regulator'] ?? '', ['ofsted', 'cqc', 'both'], true) ? $_POST['regulator'] : 'both',
            'category' => slugify((string) ($_POST['category'] ?? 'recording')) ?: 'recording',
            'status' => ($_POST['status'] ?? '') === 'published' ? 'published' : 'draft',
            'last_reviewed' => $_POST['last_reviewed'] ?: null,
            'review_due' => $_POST['review_due'] ?: null,
        ];
        if ($data['title'] === '') {
            flash_set('danger', 'A title is required.');
            redirect($id ? "/admin/templates/$id/" : '/admin/templates/new/');
        }

        // Optional file upload/replace — strictly type-checked, stored outside web root.
        if (!empty($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
            $ext = strtolower(pathinfo($_FILES['file']['name'] ?? '', PATHINFO_EXTENSION));
            $mime = (string) (new \finfo(FILEINFO_MIME_TYPE))->file($_FILES['file']['tmp_name']);
            $zipTypes = ['application/zip', 'application/octet-stream'];
            $mimeOk = isset(self::ALLOWED[$ext]) && ($mime === self::ALLOWED[$ext] || in_array($mime, $zipTypes, true));
            // DOCX/XLSX are zip containers; verify the container actually opens.
            if ($mimeOk && in_array($ext, ['docx', 'xlsx'], true)) {
                $zip = new \ZipArchive();
                $mimeOk = $zip->open($_FILES['file']['tmp_name']) === true && $zip->locateName('[Content_Types].xml') !== false;
                $zip->close();
            }
            if (!$mimeOk) {
                flash_set('danger', 'Upload rejected: only genuine DOCX, XLSX or PDF files are accepted.');
                redirect($id ? "/admin/templates/$id/" : '/admin/templates/new/');
            }
            $filename = $data['slug'] . '.' . $ext;
            $dest = STORAGE_PATH . '/templates/files/' . $filename;
            move_uploaded_file($_FILES['file']['tmp_name'], $dest);
            $data['filename'] = $filename;
            $data['format'] = $ext;
            $data['filesize'] = (int) filesize($dest);
        }

        try {
            if ($id) {
                DB::update('templates', $data, 'id = ?', [$id]);
                Audit::log('template.update', 'template', (string) $id, $data['title']);
            } else {
                if (empty($data['filename'])) {
                    flash_set('danger', 'New templates need a file uploaded.');
                    redirect('/admin/templates/new/');
                }
                $id = DB::insert('templates', $data);
                Audit::log('template.create', 'template', (string) $id, $data['title']);
            }
        } catch (\PDOException $ex) {
            if ((int) $ex->errorInfo[1] === 1062) {
                flash_set('danger', 'That slug is already used by another template — choose a different one.');
                redirect($id ? "/admin/templates/$id/" : '/admin/templates/new/');
            }
            throw $ex;
        }
        Cache::purge();
        Seo::regenerateSitemap();
        flash_set('success', 'Template saved.');
        redirect("/admin/templates/$id/");
    }

    public static function delete(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $id = (int) ($_POST['id'] ?? 0);
        $t = DB::one('SELECT filename, title FROM templates WHERE id = ?', [$id]);
        if ($t) {
            DB::run('DELETE FROM templates WHERE id = ?', [$id]);
            @unlink(STORAGE_PATH . '/templates/files/' . basename($t['filename']));
            Audit::log('template.delete', 'template', (string) $id, $t['title']);
            Cache::purge();
            Seo::regenerateSitemap();
        }
        flash_set('success', 'Template deleted.');
        redirect('/admin/templates/');
    }
}
