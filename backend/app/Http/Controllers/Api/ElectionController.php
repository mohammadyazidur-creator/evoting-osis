<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResetElectionRequest;
use App\Models\ElectionSetting;
use App\Models\Vote;
use App\Services\VoteService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ElectionController extends Controller
{
    use ApiResponse;

    public function finish(VoteService $voteService): JsonResponse
    {
        ElectionSetting::set('voting_open', '0');
        ElectionSetting::set('winner_announced', '1');

        $data = $voteService->getResults();

        return $this->successResponse($data, 'Voting resmi ditutup dan pemenang telah diumumkan.');
    }

    public function reopen(VoteService $voteService): JsonResponse
    {
        ElectionSetting::set('voting_open', '1');
        ElectionSetting::set('winner_announced', '0');

        $data = $voteService->getResults();

        return $this->successResponse($data, 'Voting berhasil dibuka kembali.');
    }

    public function reset(ResetElectionRequest $request, VoteService $voteService): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return $this->errorResponse('Password admin salah. Reset dibatalkan.', 403);
        }

        try {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            Vote::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } catch (\Throwable $e) {
            Vote::query()->delete();
        }

        ElectionSetting::set('voting_open', '1');
        ElectionSetting::set('winner_announced', '0');

        $data = $voteService->getResults();

        return $this->successResponse($data, 'Semua data suara berhasil di-reset ke awal.');
    }
}
