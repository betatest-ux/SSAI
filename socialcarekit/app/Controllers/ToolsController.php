<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\DB;
use App\Core\Seo;
use App\Core\Settings;

final class ToolsController
{
    /** Static catalogue of the eight tools (titles, blurbs, icons). */
    public static function catalogue(): array
    {
        return [
            'sleep-in-pay-checker' => [
                'title' => 'Sleep-in Pay & Minimum Wage Checker',
                'blurb' => 'Check whether your sleep-in shifts take your pay below the National Minimum Wage, using the Mencap v Tomlinson-Blake rules.',
                'icon' => 'moon',
            ],
            'holiday-accrual-calculator' => [
                'title' => 'Holiday Accrual Calculator',
                'blurb' => 'Work out statutory holiday for full-year, irregular-hours and part-year workers — including leaver pay in lieu.',
                'icon' => 'sun',
            ],
            'working-time-checker' => [
                'title' => 'Working Time Regulations Checker',
                'blurb' => 'Enter a week\'s rota and get a RAG-rated check against the Working Time Regulations 1998 — rest breaks, daily rest and the 48-hour limit.',
                'icon' => 'clock',
            ],
            'notification-decision-tool' => [
                'title' => 'Notification Decision Tool',
                'blurb' => 'Ofsted Reg 40 and CQC Regs 16–18: answer a few questions and find out whether an incident is notifiable, to whom, and how fast.',
                'icon' => 'bell',
            ],
            'acronym-decoder' => [
                'title' => 'Acronym Decoder',
                'blurb' => 'LAC, LADO, MASH, DoLS, CHC… a searchable plain-English glossary of 180+ social care acronyms.',
                'icon' => 'book',
            ],
            'body-map' => [
                'title' => 'Body Map Recorder',
                'blurb' => 'Record marks and injuries on a printable body map. Runs entirely in your browser — nothing is saved to any server.',
                'icon' => 'person',
            ],
            'visual-timer' => [
                'title' => 'Visual Timer & Now/Next Board',
                'blurb' => 'A calm, full-screen now-and-next board with a visual countdown. Works offline on a tablet once loaded.',
                'icon' => 'timer',
            ],
            'training-matrix' => [
                'title' => 'Training Matrix Tracker',
                'blurb' => 'Track team training with automatic red/amber/green expiry status. Stored only on your device, with CSV export.',
                'icon' => 'grid',
            ],
        ];
    }

    public static function index(): void
    {
        render('tools/index', ['tools' => self::catalogue()], [
            'title' => 'Free interactive tools for social care staff',
            'description' => 'Eight free browser-based tools for the UK care workforce: sleep-in pay checker, holiday calculator, WTR checker, notification decision tool, body maps and more.',
            'breadcrumbs' => [['Home', '/'], ['Tools', null]],
        ]);
    }

    private static function toolMeta(string $slug, array $extra = []): array
    {
        $tool = self::catalogue()[$slug];
        return $extra + [
            'title' => $tool['title'],
            'description' => $tool['blurb'],
            'breadcrumbs' => [['Home', '/'], ['Tools', '/tools/'], [$tool['title'], null]],
        ];
    }

    public static function sleepIn(): void
    {
        $rates = DB::all('SELECT band, label, hourly_rate, effective_from FROM nmw_rates ORDER BY effective_from DESC, band');
        render('tools/sleep-in', ['rates' => $rates], self::toolMeta('sleep-in-pay-checker', [
            'schema' => [Seo::faq([
                ['q' => 'Do sleep-in shifts count towards the National Minimum Wage?', 'a' => 'Following Royal Mencap Society v Tomlinson-Blake [2021] UKSC 8, time spent asleep during a sleep-in shift does not count as work for NMW purposes. Only time when you are awake for the purposes of working counts.'],
                ['q' => 'What should I do if I am paid below the minimum wage?', 'a' => 'Raise it with your employer first, then contact ACAS on 0300 123 1100 or complain to HMRC, which enforces the National Minimum Wage. You can also read our staff rights guides.'],
                ['q' => 'Is my data stored when I use this checker?', 'a' => 'No. The checker runs entirely in your browser. Nothing you type is sent to or stored on our servers.'],
            ])],
        ]));
    }

    public static function holiday(): void
    {
        render('tools/holiday', [], self::toolMeta('holiday-accrual-calculator', [
            'schema' => [Seo::faq([
                ['q' => 'How much statutory holiday do I get?', 'a' => 'Most workers get 5.6 weeks of paid statutory holiday per year, pro-rated for part-time work. For irregular-hours and part-year workers, holiday accrues at 12.07% of hours worked in each pay period for leave years starting on or after 1 April 2024.'],
                ['q' => 'What is rolled-up holiday pay?', 'a' => 'For irregular-hours and part-year workers, employers may pay a 12.07% uplift on top of normal pay instead of paying when leave is taken. It must be itemised separately on your payslip.'],
            ])],
        ]));
    }

    public static function workingTime(): void
    {
        $params = Settings::json('wtr_params', [
            'weekly_limit' => 48, 'daily_rest' => 11, 'weekly_rest' => 24,
            'break_minutes' => 20, 'break_trigger_hours' => 6, 'night_limit' => 8,
        ]);
        render('tools/working-time', ['params' => $params], self::toolMeta('working-time-checker', [
            'schema' => [Seo::faq([
                ['q' => 'How many hours can I legally work in a week?', 'a' => 'The Working Time Regulations 1998 limit average working time to 48 hours a week, normally averaged over 17 weeks, unless you have signed an opt-out agreement.'],
                ['q' => 'What rest breaks am I entitled to?', 'a' => 'A 20-minute uninterrupted break when working more than 6 hours, 11 hours\' rest between working days, and 24 hours\' clear rest each week (or 48 hours per fortnight). In residential care, compensatory rest rules can apply.'],
            ])],
        ]));
    }

    public static function notification(): void
    {
        render('tools/notification', [], self::toolMeta('notification-decision-tool', [
            'schema' => [Seo::faq([
                ['q' => 'When must a children\'s home notify Ofsted?', 'a' => 'Regulation 40 of the Children\'s Homes (England) Regulations 2015 lists notifiable events including the death of a child, serious illness or accident, allegations of abuse, child protection enquiries and incidents requiring police involvement. Notification must be made without delay.'],
                ['q' => 'What must a CQC provider notify?', 'a' => 'Under the CQC (Registration) Regulations 2009 (Regs 16–18), providers must notify deaths, serious injuries, abuse or allegations of abuse, DoLS applications and outcomes, incidents reported to police, and events that stop the service running safely.'],
            ])],
        ]));
    }

    public static function acronyms(): void
    {
        $entries = DB::all('SELECT acronym, full_term, meaning, sector FROM acronyms ORDER BY acronym');
        render('tools/acronyms', ['entries' => $entries], self::toolMeta('acronym-decoder', [
            'description' => 'A searchable plain-English glossary of ' . count($entries) . '+ UK social care acronyms — children\'s services, adult care, health, education and legal.',
        ]));
    }

    public static function bodyMap(): void
    {
        render('tools/body-map', [], self::toolMeta('body-map', [
            'schema' => [Seo::faq([
                ['q' => 'Is anything I enter on the body map saved?', 'a' => 'No. The body map runs entirely in your browser and nothing is transmitted or stored. Print or save the PDF to your organisation\'s own recording system before closing the page.'],
            ])],
        ]));
    }

    public static function visualTimer(): void
    {
        render('tools/visual-timer', [], self::toolMeta('visual-timer', [
            'body_class' => 'timer-page',
            'extra_head' => '<link rel="manifest" href="/tools/visual-timer/manifest.json"><meta name="theme-color" content="#0f5257">',
        ]));
    }

    public static function trainingMatrix(): void
    {
        render('tools/training-matrix', [], self::toolMeta('training-matrix'));
    }

    public static function timerManifest(): void
    {
        header('Content-Type: application/manifest+json');
        echo json_encode([
            'name' => 'SocialCareKit Visual Timer',
            'short_name' => 'Visual Timer',
            'start_url' => '/tools/visual-timer/',
            'display' => 'fullscreen',
            'orientation' => 'landscape',
            'background_color' => '#0f5257',
            'theme_color' => '#0f5257',
            'icons' => [
                ['src' => '/assets/img/timer-icon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml', 'purpose' => 'any'],
            ],
        ], JSON_UNESCAPED_SLASHES);
    }

    public static function timerServiceWorker(): void
    {
        header('Content-Type: application/javascript');
        header('Service-Worker-Allowed: /tools/visual-timer/');
        readfile(APP_ROOT . '/public/assets/js/timer-sw.js');
    }
}
