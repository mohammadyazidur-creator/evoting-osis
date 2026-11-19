<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'chairman_name',
        'chairman_class',
        'vice_name',
        'vice_class',
        'photo',
        'vision',
        'mission',
    ];

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}
