<?php
declare(strict_types=1);

namespace App\Core;

/** Minimal RFC 6238 TOTP (SHA1, 6 digits, 30s step) — no dependencies. */
final class Totp
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    public static function generateSecret(): string
    {
        $s = '';
        for ($i = 0; $i < 32; $i++) {
            $s .= self::ALPHABET[random_int(0, 31)];
        }
        return $s;
    }

    public static function verify(string $secret, string $code, int $window = 1): bool
    {
        $code = preg_replace('/\D/', '', $code) ?? '';
        if (strlen($code) !== 6) {
            return false;
        }
        $step = (int) floor(time() / 30);
        for ($i = -$window; $i <= $window; $i++) {
            if (hash_equals(self::code($secret, $step + $i), $code)) {
                return true;
            }
        }
        return false;
    }

    public static function code(string $secret, int $step): string
    {
        $key = self::base32Decode($secret);
        $data = pack('N*', 0, $step);
        $hash = hash_hmac('sha1', $data, $key, true);
        $offset = ord(substr($hash, -1)) & 0x0F;
        $value = (unpack('N', substr($hash, $offset, 4))[1] & 0x7FFFFFFF) % 1000000;
        return str_pad((string) $value, 6, '0', STR_PAD_LEFT);
    }

    public static function uri(string $secret, string $email): string
    {
        return 'otpauth://totp/' . rawurlencode('SocialCareKit:' . $email)
            . '?secret=' . $secret . '&issuer=SocialCareKit';
    }

    private static function base32Decode(string $b32): string
    {
        $b32 = strtoupper(preg_replace('/[^A-Z2-7]/i', '', $b32) ?? '');
        $bits = '';
        foreach (str_split($b32) as $c) {
            $bits .= str_pad(decbin((int) strpos(self::ALPHABET, $c)), 5, '0', STR_PAD_LEFT);
        }
        $out = '';
        foreach (str_split($bits, 8) as $byte) {
            if (strlen($byte) === 8) {
                $out .= chr((int) bindec($byte));
            }
        }
        return $out;
    }
}
