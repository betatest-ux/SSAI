<?php
declare(strict_types=1);

use App\Controllers\{PagesController, ToolsController, LibraryController, ArticlesController, FormsController};
use App\Controllers\Admin\{AuthController, DashboardController, ArticlesAdminController, TemplatesAdminController,
    AcronymsAdminController, RatesAdminController, SeoAdminController, InboxAdminController, NewsletterAdminController,
    UsersAdminController, SettingsAdminController, BackupAdminController, SearchLogAdminController};

return [
    // ---- Public pages -------------------------------------------------------
    'GET /'                => [PagesController::class, 'home'],
    'GET /about/'          => [PagesController::class, 'about'],
    'GET /contact/'        => [PagesController::class, 'contact'],
    'POST /contact/'       => [FormsController::class, 'contactSubmit'],
    'GET /privacy/'        => [PagesController::class, 'privacy'],
    'GET /terms/'          => [PagesController::class, 'terms'],
    'GET /disclaimer/'     => [PagesController::class, 'disclaimer'],
    'GET /story-builder/'  => [PagesController::class, 'storyBuilder'],
    'GET /search/'         => [PagesController::class, 'search'],
    'GET /report-error/'   => [PagesController::class, 'reportError'],
    'POST /report-error/'  => [FormsController::class, 'reportErrorSubmit'],
    'GET /health'          => [PagesController::class, 'health'],

    // Newsletter (double opt-in)
    'POST /newsletter/subscribe/'   => [FormsController::class, 'newsletterSubscribe'],
    'GET /newsletter/confirm/'      => [FormsController::class, 'newsletterConfirm'],
    'GET /newsletter/unsubscribe/'  => [FormsController::class, 'newsletterUnsubscribe'],

    // ---- Tools --------------------------------------------------------------
    'GET /tools/'                            => [ToolsController::class, 'index'],
    'GET /tools/sleep-in-pay-checker/'       => [ToolsController::class, 'sleepIn'],
    'GET /tools/holiday-accrual-calculator/' => [ToolsController::class, 'holiday'],
    'GET /tools/working-time-checker/'       => [ToolsController::class, 'workingTime'],
    'GET /tools/notification-decision-tool/' => [ToolsController::class, 'notification'],
    'GET /tools/acronym-decoder/'            => [ToolsController::class, 'acronyms'],
    'GET /tools/body-map/'                   => [ToolsController::class, 'bodyMap'],
    'GET /tools/visual-timer/'               => [ToolsController::class, 'visualTimer'],
    'GET /tools/training-matrix/'            => [ToolsController::class, 'trainingMatrix'],
    'GET /tools/visual-timer/manifest.json'  => [ToolsController::class, 'timerManifest'],
    'GET /tools/visual-timer/sw.js'          => [ToolsController::class, 'timerServiceWorker'],

    // ---- Template library ---------------------------------------------------
    'GET /templates/'         => [LibraryController::class, 'index'],
    'GET /templates/{slug}/'  => [LibraryController::class, 'show'],
    'GET /download/{slug}/'   => [LibraryController::class, 'download'],

    // ---- Articles -----------------------------------------------------------
    'GET /guides/'        => [ArticlesController::class, 'guidesIndex'],
    'GET /guides/{slug}/' => [ArticlesController::class, 'guide'],
    'GET /rights/'        => [ArticlesController::class, 'rightsIndex'],
    'GET /rights/{slug}/' => [ArticlesController::class, 'right'],

    // ---- Admin --------------------------------------------------------------
    'GET /admin/'             => [DashboardController::class, 'index'],
    'GET /admin/login/'       => [AuthController::class, 'loginForm'],
    'POST /admin/login/'      => [AuthController::class, 'login'],
    'GET /admin/2fa/'         => [AuthController::class, 'twoFactorForm'],
    'POST /admin/2fa/'        => [AuthController::class, 'twoFactor'],
    'POST /admin/logout/'     => [AuthController::class, 'logout'],
    'GET /admin/forgot/'      => [AuthController::class, 'forgotForm'],
    'POST /admin/forgot/'     => [AuthController::class, 'forgot'],
    'GET /admin/reset/'       => [AuthController::class, 'resetForm'],
    'POST /admin/reset/'      => [AuthController::class, 'reset'],

    'GET /admin/articles/'          => [ArticlesAdminController::class, 'index'],
    'GET /admin/articles/new/'      => [ArticlesAdminController::class, 'form'],
    'GET /admin/articles/{id}/'     => [ArticlesAdminController::class, 'form'],
    'POST /admin/articles/save/'    => [ArticlesAdminController::class, 'save'],
    'POST /admin/articles/delete/'  => [ArticlesAdminController::class, 'delete'],

    'GET /admin/templates/'         => [TemplatesAdminController::class, 'index'],
    'GET /admin/templates/new/'     => [TemplatesAdminController::class, 'form'],
    'GET /admin/templates/{id}/'    => [TemplatesAdminController::class, 'form'],
    'POST /admin/templates/save/'   => [TemplatesAdminController::class, 'save'],
    'POST /admin/templates/delete/' => [TemplatesAdminController::class, 'delete'],

    'GET /admin/acronyms/'          => [AcronymsAdminController::class, 'index'],
    'POST /admin/acronyms/save/'    => [AcronymsAdminController::class, 'save'],
    'POST /admin/acronyms/delete/'  => [AcronymsAdminController::class, 'delete'],

    'GET /admin/rates/'             => [RatesAdminController::class, 'index'],
    'POST /admin/rates/save/'       => [RatesAdminController::class, 'save'],
    'POST /admin/rates/delete/'     => [RatesAdminController::class, 'delete'],
    'POST /admin/rates/config/'     => [RatesAdminController::class, 'saveConfig'],

    'GET /admin/review-queue/'      => [DashboardController::class, 'reviewQueue'],

    'GET /admin/seo/'               => [SeoAdminController::class, 'index'],
    'POST /admin/seo/save/'         => [SeoAdminController::class, 'save'],
    'POST /admin/seo/delete/'       => [SeoAdminController::class, 'delete'],
    'GET /admin/redirects/'         => [SeoAdminController::class, 'redirects'],
    'POST /admin/redirects/save/'   => [SeoAdminController::class, 'redirectSave'],
    'POST /admin/redirects/delete/' => [SeoAdminController::class, 'redirectDelete'],
    'POST /admin/robots/save/'      => [SeoAdminController::class, 'robotsSave'],
    'POST /admin/sitemap/rebuild/'  => [SeoAdminController::class, 'sitemapRebuild'],
    'GET /admin/seo-check/{id}/'    => [SeoAdminController::class, 'healthCheck'],

    'GET /admin/searches/'          => [SearchLogAdminController::class, 'index'],

    'GET /admin/inbox/'             => [InboxAdminController::class, 'index'],
    'POST /admin/inbox/status/'     => [InboxAdminController::class, 'setStatus'],

    'GET /admin/newsletter/'        => [NewsletterAdminController::class, 'index'],
    'GET /admin/newsletter/export/' => [NewsletterAdminController::class, 'export'],

    'GET /admin/users/'             => [UsersAdminController::class, 'index'],
    'POST /admin/users/save/'       => [UsersAdminController::class, 'save'],
    'POST /admin/users/delete/'     => [UsersAdminController::class, 'delete'],
    'GET /admin/users/2fa/'         => [UsersAdminController::class, 'twoFactorSetup'],
    'POST /admin/users/2fa/'        => [UsersAdminController::class, 'twoFactorEnable'],
    'POST /admin/users/2fa/disable/' => [UsersAdminController::class, 'twoFactorDisable'],
    'GET /admin/audit/'             => [UsersAdminController::class, 'audit'],

    'GET /admin/site/'              => [SettingsAdminController::class, 'index'],
    'POST /admin/site/save/'        => [SettingsAdminController::class, 'save'],

    'GET /admin/backup/'            => [BackupAdminController::class, 'index'],
    'POST /admin/backup/export/'    => [BackupAdminController::class, 'export'],
    'POST /admin/backup/purge-cache/' => [BackupAdminController::class, 'purgeCache'],
    'GET /admin/logs/'              => [BackupAdminController::class, 'logs'],
];
