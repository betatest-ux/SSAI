<?php
declare(strict_types=1);

define('APP_ROOT', dirname(__DIR__));
define('APP_START', microtime(true));

// ---- Config -----------------------------------------------------------------
// config.php may live in /config or one level above the app (outside web root).
$configPaths = [
    APP_ROOT . '/config/config.php',
    dirname(APP_ROOT) . '/socialcarekit-config/config.php',
];
$config = null;
foreach ($configPaths as $p) {
    if (is_file($p)) { $config = require $p; break; }
}
if ($config === null) {
    http_response_code(500);
    exit('Configuration missing. Copy config/config.sample.php to config/config.php — see DEPLOY.md.');
}
define('APP_CONFIG', $config);
define('STORAGE_PATH', rtrim($config['storage_path'] ?? APP_ROOT . '/storage', '/'));

// ---- Error handling ---------------------------------------------------------
error_reporting(E_ALL);
if (($config['env'] ?? 'production') === 'development') {
    ini_set('display_errors', '1');
} else {
    ini_set('display_errors', '0');
}
ini_set('log_errors', '1');
ini_set('error_log', STORAGE_PATH . '/logs/php-error.log');

// ---- Autoloader -------------------------------------------------------------
spl_autoload_register(function (string $class): void {
    if (!str_starts_with($class, 'App\\')) {
        return;
    }
    $path = APP_ROOT . '/app/' . str_replace('\\', '/', substr($class, 4)) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

require APP_ROOT . '/app/helpers.php';
