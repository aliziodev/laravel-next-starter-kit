<?php

use App\Http\Controllers\AccountController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
| API routes — protected by the Sanctum guard.
|
| Requests from the first-party Next.js SPA are authenticated statefully via the
| session cookie (see `statefulApi()` in bootstrap/app.php); third-party / mobile
| clients may instead send an `Authorization: Bearer <token>` header. The Next app
| reaches these through the same-origin proxy (next-sanctum `createSanctumRouteProxy`),
| which forwards Origin/Referer so Sanctum recognises the SPA as stateful.
*/

Route::middleware('auth:sanctum')->group(function () {
    // The authenticated user — consumed by next-sanctum `getUser()` / `useUser()`.
    Route::get('/user', fn (Request $request) => $request->user());

    // Account deletion (password-confirmed) — consumed by the delete-user dialog.
    Route::delete('/account', [AccountController::class, 'destroy']);

    // The user's passkeys (safe columns only) — consumed by manage-passkeys.
    // (laravel/passkeys provides create/delete routes but no list route.)
    Route::get('/passkeys', fn (Request $request) => $request->user()
        ->passkeys()
        ->latest()
        ->get(['id', 'name', 'last_used_at', 'created_at']));
});
