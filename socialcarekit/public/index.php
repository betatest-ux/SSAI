<?php
/**
 * SocialCareKit front controller.
 * All requests are rewritten here by .htaccess.
 */
declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

App\Core\App::run();
