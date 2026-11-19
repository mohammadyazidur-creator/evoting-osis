<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCandidateRequest;
use App\Models\Candidate;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CandidateController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $candidates = Candidate::orderBy('number', 'asc')->get()->map(function ($c) {
            $photoUrl = $c->photo;
            if ($photoUrl && !str_starts_with($photoUrl, 'http') && !str_starts_with($photoUrl, '/')) {
                if (str_starts_with($photoUrl, 'assets/')) {
                    $photoUrl = '/' . $photoUrl;
                } else {
                    $photoUrl = '/api/storage/' . $photoUrl;
                }
            }
            return [
                'id' => $c->id,
                'number' => $c->number,
                'chairman_name' => $c->chairman_name,
                'chairman_class' => $c->chairman_class,
                'vice_name' => $c->vice_name,
                'vice_class' => $c->vice_class,
                'photo' => $photoUrl,
                'vision' => $c->vision,
                'mission' => $c->mission,
            ];
        });

        return $this->successResponse($candidates);
    }

    public function update(UpdateCandidateRequest $request, int $id): JsonResponse
    {
        $candidate = Candidate::findOrFail($id);

        $data = $request->only([
            'chairman_name',
            'chairman_class',
            'vice_name',
            'vice_class',
            'vision',
            'mission',
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = 'paslon_' . $candidate->number . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('candidates', $filename, 'public');

            // Delete old photo if stored in storage
            if ($candidate->photo && str_starts_with($candidate->photo, 'candidates/')) {
                Storage::disk('public')->delete($candidate->photo);
            }

            $data['photo'] = $path;
        }

        $candidate->update($data);

        return $this->successResponse($candidate, 'Data paslon berhasil diperbarui.');
    }
}
