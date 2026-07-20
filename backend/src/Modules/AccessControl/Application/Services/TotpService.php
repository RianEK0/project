<?php

namespace Modules\AccessControl\Application\Services;

use Illuminate\Support\Str;

class TotpService
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    public function generateSecret(int $length = 32): string
    {
        $secret = '';

        for ($index = 0; $index < $length; $index++) {
            $secret .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
        }

        return $secret;
    }

    public function verifyCode(string $secret, string $code): bool
    {
        $window = max(0, config('security.two_factor.window'));
        $digits = max(6, config('security.two_factor.digits'));
        $normalizedCode = preg_replace('/\D+/', '', $code) ?? '';

        if (strlen($normalizedCode) !== $digits) {
            return false;
        }

        $counter = (int) floor(now()->timestamp / max(1, config('security.two_factor.period')));

        for ($offset = -$window; $offset <= $window; $offset++) {
            if (hash_equals($normalizedCode, $this->generateHotp($secret, $counter + $offset, $digits))) {
                return true;
            }
        }

        return false;
    }

    public function provisioningUri(string $secret, string $email): string
    {
        $issuer = rawurlencode((string) config('security.two_factor.issuer'));
        $account = rawurlencode($email);
        $digits = max(6, config('security.two_factor.digits'));
        $period = max(1, config('security.two_factor.period'));

        return "otpauth://totp/{$issuer}:{$account}?secret={$secret}&issuer={$issuer}&digits={$digits}&period={$period}";
    }

    public function currentCode(string $secret): string
    {
        return $this->generateHotp(
            $secret,
            (int) floor(now()->timestamp / max(1, config('security.two_factor.period'))),
            max(6, config('security.two_factor.digits')),
        );
    }

    /**
     * @return list<string>
     */
    public function generateRecoveryCodes(): array
    {
        $codes = [];

        for ($index = 0; $index < config('security.two_factor.recovery_codes'); $index++) {
            $codes[] = Str::upper(Str::random(10));
        }

        return $codes;
    }

    private function generateHotp(string $secret, int $counter, int $digits): string
    {
        $counter = max(0, $counter);
        $binarySecret = $this->base32Decode($secret);
        $binaryCounter = pack('N*', 0).pack('N*', $counter);
        $hash = hash_hmac('sha1', $binaryCounter, $binarySecret, true);
        $offset = ord(substr($hash, -1)) & 0x0F;
        $truncated = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        );

        return str_pad((string) ($truncated % (10 ** $digits)), $digits, '0', STR_PAD_LEFT);
    }

    private function base32Decode(string $secret): string
    {
        $normalized = strtoupper(preg_replace('/[^A-Z2-7]/', '', $secret) ?? '');
        $bits = '';

        foreach (str_split($normalized) as $character) {
            $position = strpos(self::ALPHABET, $character);

            if ($position === false) {
                continue;
            }

            $bits .= str_pad(decbin($position), 5, '0', STR_PAD_LEFT);
        }

        $output = '';

        foreach (str_split($bits, 8) as $chunk) {
            if (strlen($chunk) < 8) {
                continue;
            }

            $output .= chr(bindec($chunk));
        }

        return $output;
    }
}
