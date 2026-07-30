<?php
/**
 * SocialCareKit configuration.
 *
 * Copy this file to config.php and fill in your values.
 * On shared hosting, place config.php OUTSIDE the web root if possible
 * (see DEPLOY.md). Never commit config.php to version control.
 */
return [
    // -- Database -----------------------------------------------------------
    'db' => [
        'host'     => 'localhost',
        'name'     => 'socialcarekit',
        'user'     => 'DB_USER_HERE',
        'pass'     => 'DB_PASSWORD_HERE',
        'charset'  => 'utf8mb4',
    ],

    // -- Site ---------------------------------------------------------------
    'base_url'   => 'https://socialcarekit.com', // no trailing slash
    'site_name'  => 'SocialCareKit',
    'env'        => 'production', // 'production' | 'development'

    // Absolute path to the storage directory (templates, cache, backups, logs).
    // Defaults to ../storage relative to the app; override if you moved it.
    'storage_path' => dirname(__DIR__) . '/storage',

    // -- Email (host SMTP) --------------------------------------------------
    'mail' => [
        'from'       => 'noreply@socialcarekit.com',
        'from_name'  => 'SocialCareKit',
        'admin_to'   => 'you@socialcarekit.com', // contact-form notifications
        // Uses PHP mail() via the host MTA by default. To use SMTP auth
        // instead, fill these in (host, port 587 STARTTLS assumed):
        'smtp_host'  => '',
        'smtp_user'  => '',
        'smtp_pass'  => '',
        'smtp_port'  => 587,
    ],

    // -- Security -----------------------------------------------------------
    // 64 random hex chars; used for signing tokens (unsubscribe links, etc.)
    // Generate with: php -r "echo bin2hex(random_bytes(32));"
    'app_key' => 'CHANGE_ME_64_HEX_CHARS',

    'session_lifetime_minutes' => 60,   // admin session idle expiry
    'login_max_attempts'       => 5,    // per 15 minutes per IP/email
    'login_lockout_minutes'    => 15,
];
