<div class="admin-topbar">
  <h1 style="margin:0">User management</h1>
  <div class="admin-actions">
    <a class="btn btn-sm btn-outline" href="/admin/users/2fa/">My two-factor settings</a>
    <a class="btn btn-sm btn-outline" href="/admin/audit/">Audit log</a>
  </div>
</div>

<h2><?= $editing ? 'Edit ' . e($editing['name']) : 'Add a user' ?></h2>
<form method="post" action="/admin/users/save/">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) ($editing['id'] ?? 0) ?>">
  <div class="grid grid-2">
    <div class="form-row"><label for="us-name">Name</label><input type="text" id="us-name" name="name" required value="<?= e($editing['name'] ?? '') ?>"></div>
    <div class="form-row"><label for="us-email">Email</label><input type="email" id="us-email" name="email" required value="<?= e($editing['email'] ?? '') ?>"></div>
    <div class="form-row">
      <label for="us-role">Role</label>
      <select id="us-role" name="role">
        <option value="editor" <?= ($editing['role'] ?? '') === 'editor' ? 'selected' : '' ?>>Editor — content, templates, acronyms, inbox</option>
        <option value="admin" <?= ($editing['role'] ?? '') === 'admin' ? 'selected' : '' ?>>Admin — everything, incl. users &amp; backups</option>
      </select>
    </div>
    <div class="form-row"><label for="us-pass"><?= $editing ? 'New password (blank to keep current)' : 'Password (min 12 chars)' ?></label><input type="password" id="us-pass" name="password" autocomplete="new-password" <?= $editing ? '' : 'required minlength="12"' ?>></div>
  </div>
  <button type="submit" class="btn btn-primary btn-sm"><?= $editing ? 'Save changes' : 'Create user' ?></button>
  <?php if ($editing): ?><a class="btn btn-ghost btn-sm" href="/admin/users/">Cancel</a><?php endif; ?>
</form>

<table class="admin-table">
  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>2FA</th><th>Last login</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($users as $u): ?>
    <tr>
      <td><?= e($u['name']) ?></td>
      <td><?= e($u['email']) ?></td>
      <td><span class="tag"><?= e($u['role']) ?></span></td>
      <td><?= $u['has_2fa'] ? '<span class="rag rag-green">on</span>' : '<span class="rag rag-amber">off</span>' ?></td>
      <td><?= e($u['last_login_at'] ? date('j M Y H:i', strtotime($u['last_login_at'])) : 'never') ?></td>
      <td class="admin-actions">
        <a class="btn btn-sm btn-outline" href="/admin/users/?edit=<?= (int) $u['id'] ?>">Edit</a>
        <form method="post" action="/admin/users/delete/" onsubmit="return confirm('Delete this user?')" style="display:inline">
          <?= App\Core\Csrf::field() ?>
          <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
          <button type="submit" class="btn btn-sm btn-danger">Delete</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
