<div style="max-width:420px;margin:3rem auto">
  <h1>Admin login</h1>
  <form method="post" action="/admin/login/">
    <?= App\Core\Csrf::field() ?>
    <div class="form-row"><label for="lg-email">Email</label><input type="email" id="lg-email" name="email" required autocomplete="username"></div>
    <div class="form-row"><label for="lg-pass">Password</label><input type="password" id="lg-pass" name="password" required autocomplete="current-password"></div>
    <button type="submit" class="btn btn-primary">Log in</button>
    <a class="btn btn-ghost" href="/admin/forgot/">Forgotten password?</a>
  </form>
</div>
