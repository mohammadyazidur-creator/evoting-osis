<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\ElectionSetting;
use App\Models\Vote;
use Illuminate\Support\Facades\DB;

class VoteService
{
    /**
     * Get aggregated election results (single source of truth for all pages).
     */
    public function getResults(): array
    {
        $totalVotes = Vote::count();
        $candidates = Candidate::withCount('votes')
            ->orderBy('number', 'asc')
            ->get();

        $maxVotes = $candidates->max('votes_count') ?? 0;

        $candidatesData = $candidates->map(function ($candidate) use ($totalVotes, $maxVotes) {
            $votes = (int) $candidate->votes_count;
            $percentage = $totalVotes > 0 ? round(($votes / $totalVotes) * 100, 1) : 0.0;

            // Foto URL handler
            $photoUrl = $candidate->photo;
            if ($photoUrl && !str_starts_with($photoUrl, 'http') && !str_starts_with($photoUrl, '/')) {
                if (str_starts_with($photoUrl, 'assets/')) {
                    $photoUrl = '/' . $photoUrl;
                } else {
                    $photoUrl = '/api/storage/' . $photoUrl;
                }
            }

            return [
                'id' => $candidate->id,
                'number' => (int) $candidate->number,
                'chairman_name' => $candidate->chairman_name,
                'chairman_class' => $candidate->chairman_class,
                'vice_name' => $candidate->vice_name,
                'vice_class' => $candidate->vice_class,
                'photo' => $photoUrl,
                'vision' => $candidate->vision,
                'mission' => $candidate->mission,
                'votes_count' => $votes,
                'percentage' => $percentage,
                'is_leader' => ($maxVotes > 0 && $votes === $maxVotes),
            ];
        });

        $votingOpen = (bool) ElectionSetting::get('voting_open', '1');
        $winnerAnnounced = (bool) ElectionSetting::get('winner_announced', '0');

        $status = 'open';
        if ($winnerAnnounced || !$votingOpen) {
            $status = 'finished';
        }

        $winner = null;
        if ($winnerAnnounced && $maxVotes > 0) {
            $leaders = $candidatesData->where('votes_count', $maxVotes);
            if ($leaders->count() === 1) {
                $winner = $leaders->first();
            } else {
                $winner = [
                    'is_tie' => true,
                    'candidates' => $leaders->values()->all(),
                ];
            }
        }

        return [
            'total_votes' => $totalVotes,
            'status' => $status,
            'voting_open' => $votingOpen,
            'winner_announced' => $winnerAnnounced,
            'winner' => $winner,
            'candidates' => $candidatesData->values()->all(),
            'settings' => [
                'election_title' => ElectionSetting::get('election_title', "E-Voting OSIS SMK Mamba'ul Ihsan"),
                'election_year' => ElectionSetting::get('election_year', '2026/2027'),
                'school_name' => ElectionSetting::get('school_name', "SMK Mamba'ul Ihsan"),
                'school_location' => ElectionSetting::get('school_location', 'Banyuurip, Ujungpangkah, Gresik'),
            ],
            'updated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Record a vote atomically with lock.
     */
    public function recordVote(int $candidateId, string $requestId, ?string $ipAddress = null): Vote
    {
        return DB::transaction(function () use ($candidateId, $requestId, $ipAddress) {
            $votingOpen = (bool) ElectionSetting::get('voting_open', '1');
            $winnerAnnounced = (bool) ElectionSetting::get('winner_announced', '0');

            if (!$votingOpen || $winnerAnnounced) {
                throw new \Exception('Voting telah ditutup.');
            }

            // Check duplicate request_id
            $existing = Vote::where('request_id', $requestId)->first();
            if ($existing) {
                return $existing; // Idempotent return
            }

            // Lock candidates or votes table to get next voter_number
            $lastVote = Vote::lockForUpdate()->orderBy('id', 'desc')->first();
            $nextVoterNumber = $lastVote ? ($lastVote->voter_number + 1) : 1;

            $candidate = Candidate::findOrFail($candidateId);

            return Vote::create([
                'candidate_id' => $candidate->id,
                'voter_number' => $nextVoterNumber,
                'request_id' => $requestId,
                'ip_address' => $ipAddress,
                'voted_at' => now(),
            ]);
        });
    }
}
