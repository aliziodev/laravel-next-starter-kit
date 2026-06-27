<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::redirectUserForTwoFactorAuthenticationUsing(RedirectIfTwoFactorAuthenticatable::class);

        // Point the email-verification link at the decoupled Next.js SPA instead
        // of the Laravel API. The SPA route at /email/verify/{id}/{hash} replays
        // the signed query back to the API through the proxy to finish verifying.
        VerifyEmail::createUrlUsing(function (object $notifiable) {
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());

            $signed = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes((int) config('auth.verification.expire', 60)),
                ['id' => $id, 'hash' => $hash],
            );

            $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');

            return $frontend.'/email/verify/'.$id.'/'.$hash.'?'.parse_url($signed, PHP_URL_QUERY);
        });

        // Point the password-reset link at the SPA. Headless Fortify (views=false)
        // doesn't register the `password.reset` view route, so the default
        // notification URL would throw "Route [password.reset] not defined".
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());

            return $frontend.'/reset-password?token='.$token.'&email='.$email;
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
