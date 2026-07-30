<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Cache;
use App\Core\Csrf;
use App\Core\Settings;
use App\Controllers\ToolsController;

final class SettingsAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $hero = Settings::json('hero_copy', ['heading' => '', 'lead' => '']);
        $featured = Settings::json('featured_tools', []);
        $banner = Settings::get('site_banner', '');
        $maintenance = Settings::get('maintenance_mode') === '1';
        render_admin('admin/site', [
            'hero' => $hero,
            'featured' => $featured,
            'banner' => $banner,
            'maintenance' => $maintenance,
            'catalogue' => ToolsController::catalogue(),
        ], ['title' => 'Site settings']);
    }

    public static function save(): void
    {
        Auth::requireLogin();
        Csrf::check();
        Settings::set('hero_copy', [
            'heading' => mb_substr(trim((string) ($_POST['hero_heading'] ?? '')), 0, 160),
            'lead' => mb_substr(trim((string) ($_POST['hero_lead'] ?? '')), 0, 400),
        ]);
        $valid = array_keys(ToolsController::catalogue());
        $featured = array_values(array_filter(
            array_map('trim', explode("\n", (string) ($_POST['featured_tools'] ?? ''))),
            fn($slug) => in_array($slug, $valid, true)
        ));
        Settings::set('featured_tools', $featured);
        Settings::set('site_banner', mb_substr(trim((string) ($_POST['site_banner'] ?? '')), 0, 300));
        Settings::set('maintenance_mode', !empty($_POST['maintenance_mode']) ? '1' : '0');
        Audit::log('site.settings_save', 'settings', null, 'hero/featured/banner/maintenance');
        Cache::purge();
        flash_set('success', 'Site settings saved and cache purged.');
        redirect('/admin/site/');
    }
}
