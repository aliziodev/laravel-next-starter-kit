<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Authenticate first-party SPA (Next.js) requests to `routes/api.php`
        // via Laravel's session cookie. Sanctum decides a request is "stateful"
        // from its Origin/Referer matching SANCTUM_STATEFUL_DOMAINS.
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render JSON for API routes AND any request that asks for JSON (the
        // Next.js SPA sends `Accept: application/json`). Without the expectsJson()
        // check, validation failures on Fortify's web routes (/login, /register,
        // …) would 302-redirect with HTML instead of returning 422 JSON, which
        // the SPA cannot parse.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
