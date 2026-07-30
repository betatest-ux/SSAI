<?php
/**
 * One-time setup: creates the first admin user, then disables itself.
 *
 * Visit /setup.php once after importing schema.sql + seed.sql and creating
 * config.php. After a successful run it writes storage/setup.lock and will
 * refuse to run again (delete the lock file to re-enable deliberately).
 */
declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

use App\Core\DB;

$lock = STORAGE_PATH . '/setup.lock';
$done = false;
$error = null;

if (is_file($lock)) {
    http_response_code(403);
    exit('Setup has already been completed. Delete storage/setup.lock to run it again (only do this deliberately).');
}

try {
    $existing = (int) DB::val('SELECT COUNT(*) FROM admin_users');
    if ($existing > 0) {
        @file_put_contents($lock, date('c') . " (admin user already existed)\n");
        http_response_code(403);
        exit('An admin user already exists — setup is not needed. Log in at /admin/login/.');
    }
} catch (Throwable $ex) {
    $error = 'Database connection failed — check config.php and that schema.sql has been imported. (' . e($ex->getMessage()) . ')';
}

if ($error === null && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $name = trim((string) ($_POST['name'] ?? ''));
    $pass = (string) ($_POST['password'] ?? '');
    if (!$email || $name === '' || strlen($pass) < 12) {
        $error = 'Please provide a valid email, a name, and a password of at least 12 characters.';
    } else {
        DB::insert('admin_users', [
            'email' => mb_strtolower($email),
            'name' => $name,
            'password_hash' => password_hash($pass, PASSWORD_DEFAULT),
            'role' => 'admin',
        ]);
        @file_put_contents($lock, date('c') . " by $email\n");
        $done = true;
    }
}
?>
<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>SocialCareKit setup</title>
<link rel="stylesheet" href="/assets/css/site.css">
</head>
<body>
<div class="section"><div class="container" style="max-width:520px">
<h1>SocialCareKit setup</h1>
<?php if ($done): ?>
  <div class="notice notice-success"><p><strong>Admin account created.</strong> This setup script is now disabled. <a href="/admin/login/">Log in to the admin panel →</a></p></div>
  <p>For belt and braces, delete <code>public/setup.php</code> from the server now.</p>
<?php else: ?>
  <?php if ($error): ?><div class="notice notice-danger"><p><?= e($error) ?></p></div><?php endif; ?>
  <p>Create the first administrator account. This form works exactly once.</p>
  <form method="post">
    <div class="form-row"><label for="su-name">Your name</label><input type="text" id="su-name" name="name" required></div>
    <div class="form-row"><label for="su-email">Email (this is your login)</label><input type="email" id="su-email" name="email" required></div>
    <div class="form-row"><label for="su-pass">Password (minimum 12 characters)</label><input type="password" id="su-pass" name="password" minlength="12" required></div>
    <button type="submit" class="btn btn-primary">Create admin account</button>
  </form>
<?php endif; ?>
</div></div>
</body>
</html>
