<div class="admin-topbar"><h1 style="margin:0">Redirect manager</h1></div>
<p>301 (permanent) redirects served before routing — essential whenever a URL changes. Hits are counted so you can retire dead redirects.</p>

<form method="post" action="/admin/redirects/save/">
  <?= App\Core\Csrf::field() ?>
  <div class="grid grid-3">
    <div class="form-row"><label for="rd-from">From path</label><input type="text" id="rd-from" name="from_path" required placeholder="/old-page/"></div>
    <div class="form-row"><label for="rd-to">To (path or full URL)</label><input type="text" id="rd-to" name="to_path" required placeholder="/tools/new-page/"></div>
    <div class="form-row">
      <label for="rd-code">Type</label>
      <select id="rd-code" name="http_code">
        <option value="301">301 — permanent</option>
        <option value="302">302 — temporary</option>
      </select>
    </div>
  </div>
  <button type="submit" class="btn btn-primary btn-sm">Save redirect</button>
</form>

<table class="admin-table">
  <thead><tr><th>From</th><th>To</th><th>Code</th><th>Hits</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($redirects as $r): ?>
    <tr>
      <td><code><?= e($r['from_path']) ?></code></td>
      <td><code><?= e($r['to_path']) ?></code></td>
      <td><?= (int) $r['http_code'] ?></td>
      <td><?= number_format((float) $r['hits']) ?></td>
      <td>
        <form method="post" action="/admin/redirects/delete/" style="display:inline">
          <?= App\Core\Csrf::field() ?>
          <input type="hidden" name="id" value="<?= (int) $r['id'] ?>">
          <button type="submit" class="btn btn-sm btn-danger">Delete</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$redirects): ?><tr><td colspan="5">No redirects yet.</td></tr><?php endif; ?>
  </tbody>
</table>
