<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'version' => 'v1',
        'status' => 'ok',
        'docs' => [
            'openapi' => 'docs/api/openapi.yaml',
        ],
    ]);
});
