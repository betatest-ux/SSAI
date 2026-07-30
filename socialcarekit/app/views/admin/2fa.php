<div style="max-width:420px;margin:3rem auto">
  <h1>Two-factor check</h1>
  <p>Enter the 6-digit code from your authenticator app.</p>
  <form method="post" action="/admin/2fa/">
    <?= App\Core\Csrf::field() ?>
    <div class="form-row"><label for="tf-code">Code</label><input type="text" id="tf-code" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="one-time-code" autofocus></div>
    <button type="submit" class="btn btn-primary">Verify</button>
  </form>
</div>
