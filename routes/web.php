<?php

use Illuminate\Support\Facades\Route;

/*
| This is a headless Laravel API for a decoupled Next.js frontend. The app's data
| routes live in routes/api.php (Sanctum-guarded). Fortify registers the auth
| endpoints (/login, /register, /forgot-password, /user/profile-information,
| /two-factor-*, …) on this "web" group, and Sanctum registers /sanctum/csrf-cookie.
*/

Route::get('/', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
]));
