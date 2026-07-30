<div style="max-width:420px;margin:3rem auto">
  <h1>Reset password</h1>
  <form method="post" action="/admin/forgot/">
    <?= App\Core\Csrf::field() ?>
    <div class="form-row"><label for="fg-email">Admin email</label><input type="email" id="fg-email" name="email" required></div>
    <button type="submit" class="btn btn-primary">Send reset link</button>
    <a class="btn btn-ghost" href="/admin/login/">Back to login</a>
  </form>
</div>
