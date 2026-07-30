<div style="max-width:420px;margin:3rem auto">
  <h1>Choose a new password</h1>
  <form method="post" action="/admin/reset/">
    <?= App\Core\Csrf::field() ?>
    <input type="hidden" name="token" value="<?= e($token) ?>">
    <div class="form-row"><label for="rs-pass">New password (min 12 characters)</label><input type="password" id="rs-pass" name="password" minlength="12" required autocomplete="new-password"></div>
    <button type="submit" class="btn btn-primary">Set password</button>
  </form>
</div>
