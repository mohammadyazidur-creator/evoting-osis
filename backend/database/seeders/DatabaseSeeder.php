<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\ElectionSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin
        $adminEmail = env('ADMIN_EMAIL', 'admin@smkmambaulihsan.sch.id');
        $adminPassword = env('ADMIN_PASSWORD', 'panitia123');

        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Panitia Pemilihan OSIS',
                'password' => Hash::make($adminPassword),
            ]
        );

        // 2. Seed Candidates
        $candidates = [
            [
                'number' => 1,
                'chairman_name' => 'Sabrina Awanis',
                'chairman_class' => 'XI IPS 1',
                'vice_name' => 'Meggya Ayunda',
                'vice_class' => 'XI IPA 4',
                'photo' => 'assets/img/paslon1.jpg',
                'vision' => 'Mewujudkan OSIS yang inspiratif, berkarakter santri unggul, dan berdaya saing global.',
                'mission' => "1. Meningkatkan ketakwaan dan akhlakul karimah melalui kegiatan keagamaan yang konsisten.\n2. Mengembangkan potensi siswa dalam bidang akademik, seni, dan teknologi.\n3. Menjadikan OSIS sebagai wadah aspirasi siswa yang transparan dan inklusif.\n4. Memperkuat rasa kekeluargaan dan solidaritas antarsantri dan siswa.",
            ],
            [
                'number' => 2,
                'chairman_name' => 'Latif Mulya',
                'chairman_class' => 'XI IPA 2',
                'vice_name' => 'Ricky Pebriyanto',
                'vice_class' => 'XI IPA 3',
                'photo' => 'assets/img/paslon2.jpg',
                'vision' => 'Membangun generasi santri yang mandiri, kreatif, dan berintegritas tinggi untuk kemajuan sekolah.',
                'mission' => "1. Mendorong jiwa kepemimpinan dan kemandirian melalui program kerja berbasis kewirausahaan.\n2. Menciptakan lingkungan sekolah yang bersih, asri, dan mendukung kegiatan belajar.\n3. Menyelenggarakan kegiatan ekstrakurikuler yang bervariasi dan berprestasi.\n4. Membangun komunikasi yang harmonis antara guru, murid, dan pengurus sekolah.",
            ],
            [
                'number' => 3,
                'chairman_name' => 'Adinda Fitria',
                'chairman_class' => 'XI IPS 2',
                'vice_name' => 'Bunga Kusuma',
                'vice_class' => 'XI IPA 1',
                'photo' => 'assets/img/paslon3.jpg',
                'vision' => "Mewujudkan OSIS SMK Mamba'ul Ihsan yang responsif, peduli, dan berwawasan lingkungan.",
                'mission' => "1. Mengoptimalkan peran OSIS dalam melayani dan mendengarkan kebutuhan seluruh siswa.\n2. Menggalakkan program peduli lingkungan dan kebersihan sekolah.\n3. Mengadakan kegiatan sosial dan bakti masyarakat secara berkala.\n4. Menumbuhkan semangat persatuan dan sportivitas melalui kegiatan olahraga dan seni.",
            ],
        ];

        foreach ($candidates as $cand) {
            Candidate::updateOrCreate(['number' => $cand['number']], $cand);
        }

        // 3. Seed Settings
        $settings = [
            'voting_open' => '1',
            'winner_announced' => '0',
            'election_title' => "E-Voting OSIS SMK Mamba'ul Ihsan",
            'election_year' => '2026/2027',
            'school_name' => "SMK Mamba'ul Ihsan",
            'school_location' => 'Banyuurip, Ujungpangkah, Gresik',
        ];

        foreach ($settings as $k => $v) {
            ElectionSetting::set($k, $v);
        }
    }
}
