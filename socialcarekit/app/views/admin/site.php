<div class="admin-topbar"><h1 style="margin:0">Site settings</h1></div>

<?php if ($maintenance): ?>
<div class="notice notice-danger"><p><strong>Maintenance mode is ON</strong> — visitors see the holding page. Admin still works.</p></div>
<?php endif; ?>

<form method="post" action="/admin/site/save/">
  <?= App\Core\Csrf::field() ?>

  <h2>Homepage hero</h2>
  <div class="form-row"><label for="st-hh">Heading</label><input type="text" id="st-hh" name="hero_heading" value="<?= e($hero['heading']) ?>" style="max-width:none"></div>
  <div class="form-row"><label for="st-hl">Lead paragraph</label><textarea id="st-hl" name="hero_lead" rows="2" style="max-width:none"><?= e($hero['lead']) ?></textarea></div>

  <h2>Featured tools (order shown on the homepage)</h2>
  <div class="form-row">
    <label for="st-ft">One slug per line, top first</label>
    <p class="form-hint">Available: <?= e(implode(', ', array_keys($catalogue))) ?></p>
    <textarea id="st-ft" name="featured_tools" rows="6" style="font-family:ui-monospace,monospace"><?= e(implode("\n", $featured)) ?></textarea>
  </div>

  <h2>Site-wide banner</h2>
  <div class="form-row">
    <label for="st-banner">Banner text (blank = no banner) — e.g. “NMW rates updated April 2027”</label>
    <input type="text" id="st-banner" name="site_banner" value="<?= e($banner) ?>" style="max-width:none">
  </div>

  <h2>Maintenance mode</h2>
  <label class="check-row"><input type="checkbox" name="maintenance_mode" value="1" <?= $maintenance ? 'checked' : '' ?>> Show the “back soon” holding page to visitors (admin unaffected)</label>

  <p style="margin-top:1.2rem"><button type="submit" class="btn btn-primary">Save settings</button></p>
</form>
