<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Honeypot + time-trap spam protection for public forms.
 * No third-party CAPTCHA, no cookies.
 */
final class SpamGuard
{
    /** Hidden fields to embed in every public form. */
    public static function fields(): string
    {
        $ts = time();
        $sig = sign_token('form-ts:' . $ts);
        return '<div class="hp-field" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>'
            . '<input type="hidden" name="_ts" value="' . $ts . ':' . e($sig) . '">';
    }

    /** True if the submission looks like spam. */
    public static function isSpam(): bool
    {
        // Honeypot filled → bot.
        if (!empty($_POST['website'])) {
            return true;
        }
        // Time trap: forms submitted in under 3 seconds (or with a forged/expired
        // timestamp older than 24h) are rejected.
        $raw = (string) ($_POST['_ts'] ?? '');
        if (!str_contains($raw, ':')) {
            return true;
        }
        [$ts, $sig] = explode(':', $raw, 2);
        if (!verify_token('form-ts:' . $ts, $sig)) {
            return true;
        }
        $age = time() - (int) $ts;
        return $age < 3 || $age > 86400;
    }
}
