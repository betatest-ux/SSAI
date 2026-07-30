<div class="admin-topbar"><h1 style="margin:0">Rates &amp; rules</h1></div>
<p>Annual legal updates happen here — no code deploy needed. Add the new NMW rates each April with their effective date; tools automatically pick the current rate.</p>

<h2>Add / update an NMW rate</h2>
<form method="post" action="/admin/rates/save/">
  <?= App\Core\Csrf::field() ?>
  <div class="grid grid-4">
    <div class="form-row">
      <label for="rt-band">Band</label>
      <select id="rt-band" name="band">
        <option value="nlw_21_over">NLW (21+)</option>
        <option value="age_18_20">18–20</option>
        <option value="age_16_17">16–17</option>
        <option value="apprentice">Apprentice</option>
      </select>
    </div>
    <div class="form-row"><label for="rt-label">Label</label><input type="text" id="rt-label" name="label" required placeholder="National Living Wage (21 and over)"></div>
    <div class="form-row"><label for="rt-rate">Hourly rate (£)</label><input type="number" id="rt-rate" name="hourly_rate" step="0.01" min="0" required></div>
    <div class="form-row"><label for="rt-from">Effective from</label><input type="date" id="rt-from" name="effective_from" required></div>
  </div>
  <button type="submit" class="btn btn-primary btn-sm">Save rate</button>
</form>

<table class="admin-table">
  <thead><tr><th>Band</th><th>Label</th><th>Rate</th><th>Effective from</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($rates as $r): ?>
    <tr>
      <td><code><?= e($r['band']) ?></code></td>
      <td><?= e($r['label']) ?></td>
      <td>£<?= e($r['hourly_rate']) ?></td>
      <td><?= e(format_date($r['effective_from'])) ?></td>
      <td>
        <form method="post" action="/admin/rates/delete/" onsubmit="return confirm('Delete this rate row?')" style="display:inline">
          <?= App\Core\Csrf::field() ?>
          <input type="hidden" name="id" value="<?= (int) $r['id'] ?>">
          <button type="submit" class="btn btn-sm btn-danger">Delete</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>

<h2>Working Time Regulations parameters</h2>
<p class="form-hint">These feed the WTR checker. Only change them if the law changes.</p>
<form method="post" action="/admin/rates/config/">
  <?= App\Core\Csrf::field() ?>
  <div class="grid grid-3">
    <div class="form-row"><label for="wt-wl">Weekly limit (hours)</label><input type="number" id="wt-wl" name="weekly_limit" value="<?= (int) $wtr['weekly_limit'] ?>"></div>
    <div class="form-row"><label for="wt-dr">Daily rest (hours)</label><input type="number" id="wt-dr" name="daily_rest" value="<?= (int) $wtr['daily_rest'] ?>"></div>
    <div class="form-row"><label for="wt-wr">Weekly rest (hours)</label><input type="number" id="wt-wr" name="weekly_rest" value="<?= (int) $wtr['weekly_rest'] ?>"></div>
    <div class="form-row"><label for="wt-bm">Break (minutes)</label><input type="number" id="wt-bm" name="break_minutes" value="<?= (int) $wtr['break_minutes'] ?>"></div>
    <div class="form-row"><label for="wt-bt">Break trigger (hours)</label><input type="number" id="wt-bt" name="break_trigger_hours" step="0.5" value="<?= e((string) $wtr['break_trigger_hours']) ?>"></div>
    <div class="form-row"><label for="wt-nl">Night limit (hours)</label><input type="number" id="wt-nl" name="night_limit" value="<?= (int) $wtr['night_limit'] ?>"></div>
  </div>
  <button type="submit" class="btn btn-primary btn-sm">Save WTR parameters</button>
</form>
