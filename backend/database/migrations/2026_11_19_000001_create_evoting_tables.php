<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('number')->unique();
            $table->string('chairman_name');
            $table->string('chairman_class');
            $table->string('vice_name');
            $table->string('vice_class');
            $table->string('photo')->nullable();
            $table->text('vision');
            $table->text('mission');
            $table->timestamps();
        });

        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->unsignedInteger('voter_number');
            $table->string('request_id')->unique();
            $table->string('ip_address')->nullable();
            $table->timestamp('voted_at');

            $table->index('candidate_id');
        });

        Schema::create('election_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('election_settings');
        Schema::dropIfExists('votes');
        Schema::dropIfExists('candidates');
    }
};
