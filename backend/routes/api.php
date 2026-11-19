<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CandidateController;
use App\Http\Controllers\Api\ElectionController;
use App\Http\Controllers\Api\ResultController;
use App\Http\Controllers\Api\VoteController;
use Illuminate\Support\Facades\Route;

// Public Endpoints (ZERO session, ZERO cookies, no StartSession)
Route::get('/state', [ResultController::class, 'state']);
Route::get('/results', [ResultController::class, 'results']);
Route::get('/candidates', [CandidateController::class, 'index']);
Route::middleware('throttle:60,1')->post('/votes', [VoteController::class, 'store']);

// Admin & Auth Endpoints (Session in database, stateful cookie)
Route::middleware([
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
])->group(function () {
    Route::middleware('throttle:5,1')->post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:web')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::get('/votes/history', [VoteController::class, 'history']);
        Route::post('/election/finish', [ElectionController::class, 'finish']);
        Route::post('/election/reopen', [ElectionController::class, 'reopen']);
        Route::post('/election/reset', [ElectionController::class, 'reset']);
        Route::put('/candidates/{id}', [CandidateController::class, 'update']);
        Route::post('/candidates/{id}', [CandidateController::class, 'update']);
    });
});
