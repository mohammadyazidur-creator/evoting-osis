<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'chairman_name' => ['required', 'string', 'max:255'],
            'chairman_class' => ['required', 'string', 'max:50'],
            'vice_name' => ['required', 'string', 'max:255'],
            'vice_class' => ['required', 'string', 'max:50'],
            'vision' => ['required', 'string'],
            'mission' => ['required', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }
}
