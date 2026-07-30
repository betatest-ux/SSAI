<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Audit;
use App\Core\Auth;
use App\Core\Cache;
use App\Core\Csrf;
use App\Core\DB;
use App\Core\Settings;

final class RatesAdminController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $rates = DB::all('SELECT * FROM nmw_rates ORDER BY effective_from DESC, band');
        $wtr = Settings::json('wtr_params', [
            'weekly_limit' => 48, 'daily_rest' => 11, 'weekly_rest' => 24,
            'break_minutes' => 20, 'break_trigger_hours' => 6, 'night_limit' => 8,
        ]);
        render_admin('admin/rates', ['rates' => $rates, 'wtr' => $wtr], ['title' => 'Rates & rules']);
    }

    public static function save(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $band = (string) ($_POST['band'] ?? '');
        $label = trim((string) ($_POST['label'] ?? ''));
        $rate = (float) ($_POST['hourly_rate'] ?? 0);
        $from = (string) ($_POST['effective_from'] ?? '');
        if (!in_array($band, ['nlw_21_over', 'age_18_20', 'age_16_17', 'apprentice'], true) || $rate <= 0 || !$from || $label === '') {
            flash_set('danger', 'All fields are required and the rate must be positive.');
            redirect('/admin/rates/');
        }
        DB::run(
            'INSERT INTO nmw_rates (band, label, hourly_rate, effective_from) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE hourly_rate = VALUES(hourly_rate), label = VALUES(label)',
            [$band, $label, number_format($rate, 2, '.', ''), $from]
        );
        Audit::log('rates.save', 'nmw_rate', $band, "£$rate from $from");
        Cache::purge();
        flash_set('success', 'Rate saved. The sleep-in checker now uses whichever rate is current for each band.');
        redirect('/admin/rates/');
    }

    public static function delete(): void
    {
        Auth::requireLogin();
        Csrf::check();
        DB::run('DELETE FROM nmw_rates WHERE id = ?', [(int) ($_POST['id'] ?? 0)]);
        Audit::log('rates.delete', 'nmw_rate', (string) ($_POST['id'] ?? ''));
        Cache::purge();
        flash_set('success', 'Rate row deleted.');
        redirect('/admin/rates/');
    }

    public static function saveConfig(): void
    {
        Auth::requireLogin();
        Csrf::check();
        $wtr = [
            'weekly_limit' => max(1, (int) ($_POST['weekly_limit'] ?? 48)),
            'daily_rest' => max(1, (int) ($_POST['daily_rest'] ?? 11)),
            'weekly_rest' => max(1, (int) ($_POST['weekly_rest'] ?? 24)),
            'break_minutes' => max(1, (int) ($_POST['break_minutes'] ?? 20)),
            'break_trigger_hours' => max(1, (float) ($_POST['break_trigger_hours'] ?? 6)),
            'night_limit' => max(1, (int) ($_POST['night_limit'] ?? 8)),
        ];
        Settings::set('wtr_params', $wtr);
        Audit::log('rates.wtr_params', 'settings', 'wtr_params', json_encode($wtr));
        Cache::purge();
        flash_set('success', 'Working time parameters saved — the WTR checker uses them immediately.');
        redirect('/admin/rates/');
    }
}
