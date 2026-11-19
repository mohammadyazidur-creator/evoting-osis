<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VoteService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ResultController extends Controller
{
    use ApiResponse;

    public function results(VoteService $voteService): JsonResponse
    {
        $data = $voteService->getResults();
        return $this->successResponse($data);
    }

    public function state(VoteService $voteService): JsonResponse
    {
        $data = $voteService->getResults();
        return $this->successResponse($data);
    }
}
