<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VoteRequest;
use App\Models\Vote;
use App\Services\VoteService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    use ApiResponse;

    public function store(VoteRequest $request, VoteService $voteService): JsonResponse
    {
        try {
            $vote = $voteService->recordVote(
                $request->input('candidate_id'),
                $request->input('request_id'),
                $request->ip()
            );

            return $this->successResponse([
                'id' => $vote->id,
                'voter_number' => $vote->voter_number,
                'voted_at' => $vote->voted_at->toIso8601String(),
            ], 'Suara Anda berhasil disimpan! Terima kasih telah berpartisipasi.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function history(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 20);

        $votes = Vote::with('candidate')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        $transformed = $votes->getCollection()->map(function ($v) {
            return [
                'id' => $v->id,
                'voter_number' => $v->voter_number,
                'voter_label' => 'Pemilih ' . $v->voter_number,
                'candidate' => $v->candidate ? [
                    'id' => $v->candidate->id,
                    'number' => $v->candidate->number,
                    'chairman_name' => $v->candidate->chairman_name,
                    'vice_name' => $v->candidate->vice_name,
                ] : null,
                'ip_address' => $v->ip_address,
                'voted_at' => $v->voted_at ? $v->voted_at->toIso8601String() : null,
                'voted_at_formatted' => $v->voted_at ? $v->voted_at->format('d/m/Y H:i:s') : null,
            ];
        });

        return $this->successResponse([
            'items' => $transformed,
            'current_page' => $votes->currentPage(),
            'last_page' => $votes->lastPage(),
            'per_page' => $votes->perPage(),
            'total' => $votes->total(),
        ]);
    }
}
