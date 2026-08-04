<?php
/**
 * Docker test-environment config (created automatically by the entrypoint).
 * Matches the credentials in docker-compose.yml. NOT for production.
 */
return [
    'db' => [
        'host'    => 'db',
        'name'    => 'socialcarekit',
        'user'    => 'sck',
        'pass'    => 'sckpass',
        'charset' => 'utf8mb4',
    ],
    'base_url'   => 'http://localhost:8080',
    'site_name'  => 'SocialCareKit',
    'env'        => 'development',
    'storage_path' => dirname(__DIR__) . '/storage',
    'mail' => [
        'from'      => 'noreply@localhost',
        'from_name' => 'SocialCareKit (local)',
        'admin_to'  => '',
        'smtp_host' => '', 'smtp_user' => '', 'smtp_pass' => '', 'smtp_port' => 587,
    ],
    'app_key' => 'localtestkey_localtestkey_localtestkey_localtestkey_localtest_00',
    'session_lifetime_minutes' => 240,
    'login_max_attempts'       => 5,
    'login_lockout_minutes'    => 15,
];
