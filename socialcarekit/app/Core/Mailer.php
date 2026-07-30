<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Transactional email via the host MTA (PHP mail()) or authenticated SMTP
 * (STARTTLS on port 587) when smtp_host is configured. No dependencies.
 */
final class Mailer
{
    public static function send(string $to, string $subject, string $bodyText, ?string $bodyHtml = null): bool
    {
        $from = config('mail.from', 'noreply@localhost');
        $fromName = config('mail.from_name', 'SocialCareKit');
        $boundary = 'b' . bin2hex(random_bytes(12));

        $headers = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$from>\r\n"
            . "Reply-To: $from\r\n"
            . "MIME-Version: 1.0\r\n"
            . "X-Mailer: SocialCareKit\r\n";

        if ($bodyHtml !== null) {
            $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
            $body = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n$bodyText\r\n"
                . "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n$bodyHtml\r\n--$boundary--";
        } else {
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";
            $body = $bodyText;
        }

        $smtpHost = config('mail.smtp_host', '');
        if ($smtpHost !== '') {
            return self::smtpSend($to, $subject, $headers, $body);
        }
        $encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        return @mail($to, $encSubject, $body, $headers);
    }

    private static function smtpSend(string $to, string $subject, string $headers, string $body): bool
    {
        $host = config('mail.smtp_host');
        $port = (int) config('mail.smtp_port', 587);
        $user = config('mail.smtp_user');
        $pass = config('mail.smtp_pass');
        $from = config('mail.from');

        $fp = @stream_socket_client("tcp://$host:$port", $errno, $errstr, 15);
        if (!$fp) {
            error_log("SMTP connect failed: $errstr");
            return false;
        }
        $say = function (string $cmd) use ($fp): string {
            if ($cmd !== '') {
                fwrite($fp, $cmd . "\r\n");
            }
            $resp = '';
            while ($line = fgets($fp, 515)) {
                $resp .= $line;
                if (isset($line[3]) && $line[3] === ' ') {
                    break;
                }
            }
            return $resp;
        };
        try {
            $say('');
            $say('EHLO ' . parse_url(config('base_url', 'localhost'), PHP_URL_HOST));
            $resp = $say('STARTTLS');
            if (!str_starts_with($resp, '220')) {
                throw new \RuntimeException('STARTTLS refused');
            }
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new \RuntimeException('TLS failed');
            }
            $say('EHLO socialcarekit');
            $say('AUTH LOGIN');
            $say(base64_encode((string) $user));
            $resp = $say(base64_encode((string) $pass));
            if (!str_starts_with($resp, '235')) {
                throw new \RuntimeException('SMTP auth failed');
            }
            $say("MAIL FROM:<$from>");
            $say("RCPT TO:<$to>");
            $say('DATA');
            $encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
            $msg = $headers . "To: <$to>\r\nSubject: $encSubject\r\n\r\n" . $body . "\r\n.";
            $resp = $say($msg);
            $say('QUIT');
            return str_starts_with($resp, '250');
        } catch (\Throwable $ex) {
            error_log('SMTP send failed: ' . $ex->getMessage());
            return false;
        } finally {
            fclose($fp);
        }
    }
}
