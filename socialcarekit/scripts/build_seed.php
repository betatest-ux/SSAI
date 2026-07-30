<?php
/**
 * Build database/seed.sql from the JSON content in database/seed-content/.
 * Run locally: php scripts/build_seed.php
 * The resulting seed.sql is imported once, after schema.sql, via phpMyAdmin.
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$out = [];
$out[] = '-- SocialCareKit seed data (generated ' . date('Y-m-d') . ' by scripts/build_seed.php)';
$out[] = 'SET NAMES utf8mb4;';
$out[] = '';

function q(?string $s): string
{
    if ($s === null) {
        return 'NULL';
    }
    return "'" . str_replace(["\\", "'"], ["\\\\", "\\'"], $s) . "'";
}

// ---- Articles (guides + rights) --------------------------------------------
$reviewDue = date('Y-m-d', strtotime('+12 months'));
foreach (['guides', 'rights'] as $section) {
    foreach (glob("$root/database/seed-content/$section/*.json") ?: [] as $file) {
        $a = json_decode(file_get_contents($file), true);
        if (!$a) {
            fwrite(STDERR, "Skipping unparsable $file\n");
            continue;
        }
        $out[] = sprintf(
            "INSERT INTO articles (slug, section, title, meta_description, summary, key_legislation, body_html, status, review_due, published_at) VALUES (%s, %s, %s, %s, %s, %s, %s, 'published', %s, NOW())\n  ON DUPLICATE KEY UPDATE title = VALUES(title), meta_description = VALUES(meta_description), summary = VALUES(summary), key_legislation = VALUES(key_legislation), body_html = VALUES(body_html);",
            q($a['slug']),
            q($section),
            q($a['title']),
            q($a['meta_description']),
            q($a['summary']),
            q(json_encode($a['key_legislation'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)),
            q($a['body_html']),
            q($reviewDue)
        );
    }
}
$out[] = '';

// ---- Templates --------------------------------------------------------------
$templates = json_decode(file_get_contents("$root/database/seed-content/templates.json"), true) ?: [];
foreach ($templates as $t) {
    $path = "$root/storage/templates/files/" . $t['filename'];
    $size = is_file($path) ? filesize($path) : 0;
    if (!$size) {
        fwrite(STDERR, "WARNING: template file missing: {$t['filename']}\n");
    }
    $out[] = sprintf(
        "INSERT INTO templates (slug, title, description, supports, regulator, category, format, filename, filesize, status, last_reviewed, review_due) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %d, 'published', '2026-07-01', %s)\n  ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), supports = VALUES(supports), filesize = VALUES(filesize);",
        q($t['slug']), q($t['title']), q($t['description']), q($t['supports'] ?? null),
        q($t['regulator']), q($t['category']), q($t['format']), q($t['filename']), $size, q($reviewDue)
    );
}
$out[] = '';

// ---- Acronyms ----------------------------------------------------------------
$acronyms = json_decode(file_get_contents("$root/database/seed-content/acronyms.json"), true) ?: [];
foreach ($acronyms as $a) {
    $out[] = sprintf(
        'INSERT INTO acronyms (acronym, full_term, meaning, sector) VALUES (%s, %s, %s, %s) ON DUPLICATE KEY UPDATE meaning = VALUES(meaning), sector = VALUES(sector);',
        q($a['acronym']), q($a['full_term']), q($a['meaning']), q($a['sector'])
    );
}
$out[] = '';

// ---- NMW rates (update annually via the admin panel) ------------------------
$rates = [
    // band, label, rate, effective_from
    ['nlw_21_over', 'National Living Wage (21 and over)', '12.21', '2025-04-01'],
    ['age_18_20',  '18–20 rate',                          '10.00', '2025-04-01'],
    ['age_16_17',  '16–17 rate',                          '7.55',  '2025-04-01'],
    ['apprentice', 'Apprentice rate',                     '7.55',  '2025-04-01'],
    ['nlw_21_over', 'National Living Wage (21 and over)', '11.44', '2024-04-01'],
    ['age_18_20',  '18–20 rate',                          '8.60',  '2024-04-01'],
    ['age_16_17',  '16–17 rate',                          '6.40',  '2024-04-01'],
    ['apprentice', 'Apprentice rate',                     '6.40',  '2024-04-01'],
];
foreach ($rates as [$band, $label, $rate, $from]) {
    $out[] = sprintf(
        "INSERT INTO nmw_rates (band, label, hourly_rate, effective_from) VALUES (%s, %s, %s, %s) ON DUPLICATE KEY UPDATE hourly_rate = VALUES(hourly_rate);",
        q($band), q($label), q($rate), q($from)
    );
}
$out[] = '';

// ---- Default settings --------------------------------------------------------
$settings = [
    'wtr_params' => json_encode([
        'weekly_limit' => 48, 'daily_rest' => 11, 'weekly_rest' => 24,
        'break_minutes' => 20, 'break_trigger_hours' => 6, 'night_limit' => 8,
    ]),
    'hero_copy' => json_encode([
        'heading' => 'Practical tools for people who do the real work of care',
        'lead' => "Free calculators, templates and plain-English guidance for the UK social care workforce — children's homes and adult services, Ofsted and CQC.",
    ], JSON_UNESCAPED_UNICODE),
    'featured_tools' => json_encode(['sleep-in-pay-checker', 'holiday-accrual-calculator', 'notification-decision-tool', 'acronym-decoder', 'training-matrix', 'body-map']),
    'maintenance_mode' => '0',
];
foreach ($settings as $k => $v) {
    $out[] = sprintf(
        'INSERT INTO settings (setting_key, setting_value) VALUES (%s, %s) ON DUPLICATE KEY UPDATE setting_value = setting_value;',
        q($k), q($v)
    );
}

file_put_contents("$root/database/seed.sql", implode("\n", $out) . "\n");
echo 'Wrote database/seed.sql (' . number_format(strlen(implode("\n", $out))) . " bytes)\n";
