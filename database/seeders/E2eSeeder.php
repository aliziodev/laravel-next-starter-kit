<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds known, verified users for the Playwright e2e suite and clears their
 * passkeys / two-factor state so each run starts from a clean slate. A
 * dedicated 2FA user keeps enabling two-factor auth from breaking the plain
 * login tests. Kept separate from DatabaseSeeder so it never runs during
 * normal app setup.
 */
class E2eSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            'e2e@example.com' => 'E2E User',
            '2fa@example.com' => '2FA User',
        ];

        foreach ($users as $email => $name) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    // The model's `hashed` cast hashes this on save.
                    'password' => 'password',
                    'email_verified_at' => now(),
                    'two_factor_secret' => null,
                    'two_factor_recovery_codes' => null,
                    'two_factor_confirmed_at' => null,
                ],
            );

            $user->passkeys()->delete();
        }
    }
}
