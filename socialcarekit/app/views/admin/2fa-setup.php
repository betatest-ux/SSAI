<div class="admin-topbar"><h1 style="margin:0">Two-factor authentication</h1></div>

<?php if (!empty($me['totp_secret'])): ?>
<div class="notice notice-success"><p>2FA is <strong>enabled</strong> on your account.</p></div>
<form method="post" action="/admin/users/2fa/disable/" onsubmit="return confirm('Disable two-factor authentication?')">
  <?= App\Core\Csrf::field() ?>
  <button type="submit" class="btn btn-danger btn-sm">Disable 2FA</button>
</form>
<?php else: ?>
<p>Add your account to an authenticator app (Aegis, Google Authenticator, 1Password…):</p>
<ol>
  <li>Choose “enter a setup key manually” in your app and enter:<br>
      <code style="font-size:1.1rem;letter-spacing:.08em"><?= e(trim(chunk_split($secret, 4, ' '))) ?></code><br>
      <span class="search-kind">Account: <?= e($me['email']) ?> · Issuer: SocialCareKit · Time-based, 6 digits</span></li>
  <li>Or open this link on the device that has your authenticator: <a href="<?= e($uri) ?>">otpauth setup link</a></li>
  <li>Enter the current 6-digit code to confirm:</li>
</ol>
<form method="post" action="/admin/users/2fa/">
  <?= App\Core\Csrf::field() ?>
  <div class="form-row" style="max-width:220px">
    <label for="tfs-code">Code from app</label>
    <input type="text" id="tfs-code" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required>
  </div>
  <button type="submit" class="btn btn-primary btn-sm">Enable 2FA</button>
</form>
<?php endif; ?>
