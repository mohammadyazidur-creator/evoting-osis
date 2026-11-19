# 🗳️ E-Voting OSIS — SMK Mamba'ul Ihsan
### Banyuurip, Ujungpangkah, Gresik | Masa Bakti 2026/2027

Aplikasi Sistem Pemilihan Ketua & Wakil Ketua OSIS modern berbasis **Backend Laravel 11 (PHP 8.2+, MySQL, Sanctum)** dan **Frontend HTML5 + Tailwind CSS (Standalone CLI) + Vanilla JavaScript (ES Modules)**.

---

## 🏗️ Struktur Proyek

```
evoting-osis/
├── backend/                          # Laravel 11
│   ├── app/Http/Controllers/Api/
│   │   ├── AuthController.php        # Login, logout, current user
│   │   ├── CandidateController.php   # List & edit paslon (+ upload foto)
│   │   ├── VoteController.php        # Input suara (atomik + lock) & riwayat
│   │   ├── ResultController.php      # Hasil quick count & state
│   │   └── ElectionController.php    # Finish/umumkan, buka kembali, reset
│   ├── app/Services/VoteService.php  # SATU sumber hitung suara & persentase
│   ├── app/Traits/ApiResponse.php    # Format seragam {success, message, data}
│   ├── database/migrations/          # Tabel users, candidates, votes, settings
│   ├── database/seeders/             # Seed admin default, 3 paslon, pengaturan
│   ├── routes/api.php                # Rute API publik & admin
│   └── .env.example
└── frontend/
    ├── index.html                    # Bilik suara siswa (HP 2)
    ├── live.html                     # Layar live quick count (HP 1 / TV)
    ├── login.html                    # Login panitia
    ├── hasil.html                    # Grafik batang BESAR di tengah (admin)
    ├── tabel.html                    # Tabel rekapitulasi suara
    ├── persentase.html               # Diagram donut persentase suara
    ├── riwayat.html                  # Log transaksi pemilih berpaginasi
    ├── paslon.html                   # Kelola paslon + upload foto
    ├── tailwind.config.js            # Konfigurasi warna & font tema
    ├── tailwindcss.exe               # Standalone CLI Tailwind (tanpa Node.js)
    ├── build.bat / watch.bat         # Skrip compile Tailwind
    ├── src/input.css                 # @tailwind + @layer components
    └── assets/
        ├── css/app.css               # Hasil build Tailwind (di-commit)
        ├── js/                       # Modul Vanilla JS (config, api, ui, charts, dsb.)
        ├── lib/                      # Chart.js, SheetJS, Confetti (lokal)
        └── img/                      # Foto paslon, logo SMK, background
```

---

## 🌐 Skenario Pemakaian di Lapangan (Real Device)

| Perangkat | Alamat Akses | Autentikasi | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **HP 1** (TV / Proyektor / HP Panitia) | `http://[IP-LAPTOP]/live.html` | Publik (Tanpa Login) | Grafik live quick count, kartu paslon unggul, polling otomatis 3 detik, overlay pemenang. |
| **HP 2** (Bilik Suara Siswa) | `http://[IP-LAPTOP]/` | Publik (Tanpa Login) | Hero screen $\rightarrow$ katalog paslon (1 tombol `>` per kartu) $\rightarrow$ modal konfirmasi $\rightarrow$ layar sukses (konfeti & countdown 5 detik). |
| **Laptop Panitia** (Server Laragon) | `http://[IP-LAPTOP]/login.html` | Admin Panitia | Grafik besar di tengah, tabel rekap, ekspor Excel 2 sheet, riwayat suara, umumkan pemenang, dan reset. |

> **Contoh URL Nyata**: Jika IP laptop panitia adalah `192.168.1.56`, maka HP siswa mengakses `http://192.168.1.56/` dan TV membuka `http://192.168.1.56/live.html`.

---

## ⚙️ Petunjuk Instalasi & Setup Laragon

### 1. Kebutuhan Sistem
* Laragon (Apache + MySQL aktif)
* PHP 8.2+ (tersedia di `C:\laragon2\bin\php\php-8.2.35-Win32-vs16-x64`)
* Composer

### 2. Setup Database & Backend
1. Pastikan MySQL di Laragon aktif. Database `evoting_osis` dibuat otomatis (atau jalankan query: `CREATE DATABASE evoting_osis;`).
2. Masuk ke folder backend:
   ```bash
   cd C:\laragon\www\evoting-osis\backend
   ```
3. Salin file environment:
   ```bash
   cp .env.example .env
   ```
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Hubungkan direktori storage untuk foto paslon:
   ```bash
   php artisan storage:link
   ```
6. Jalankan migrasi dan seeder awal:
   ```bash
   php artisan migrate:fresh --seed
   ```

### 3. Akun Admin Default

* **Email**: `admin@smkmambaulihsan.sch.id`
* **Password**: `panitia123`

> [!WARNING]
> **PENTING**: Segera ganti password admin di file `.env` (`ADMIN_PASSWORD`) atau melalui database sebelum pemilihan sungguhan dimulai untuk mencegah akses tidak sah!

---

## 🎨 Membangun CSS Tailwind (Frontend)

File `assets/css/app.css` **sudah di-build dan siap pakai tanpa perlu menjalankan apapun**.  
Jika Anda ingin mengubah style CSS atau menambahkan kelas baru:
* Cukup klik ganda (double-click) file **`frontend/build.bat`**, atau:
* Jalankan `frontend/watch.bat` untuk memantau perubahan otomatis selama pengembangan.

*(Menggunakan `tailwindcss.exe` standalone CLI murni — **tanpa perlu install Node/npm**).*

---

## 📶 Konfigurasi Jaringan & Firewall untuk Akses HP

1. **Cek Alamat IP Laptop**:
   Buka Command Prompt / PowerShell, ketik:
   ```cmd
   ipconfig
   ```
   Cari baris `IPv4 Address` pada adaptor Wi-Fi/Ethernet Anda (contoh: `192.168.1.56`).

2. **Buka Port 80 di Windows Firewall**:
   Agar HP siswa dapat mengakses web server di laptop, jalankan perintah berikut di PowerShell (Run as Administrator):
   ```powershell
   netsh advfirewall firewall add rule name="Apache E-Voting Port 80" dir=in action=allow protocol=TCP localport=80
   ```

3. **Limit Header Apache (Pencegahan Error 400)**:
   Pada konfigurasi Apache (`00-default.conf` di Laragon), telah dipasang direktif:
   ```apache
   LimitRequestFieldSize 16384
   LimitRequestLine 16384
   ```

4. **Pembersihan Cookie Browser (Jika Pernah Mengalami Error 400)**:
   Jika browser Anda sebelumnya pernah menyimpan cookie sesi lama yang besar, lakukan pembersihan cookie sekali saja:
   - Di Google Chrome: Tekan `F12` $\rightarrow$ tab **Application** $\rightarrow$ **Cookies** $\rightarrow$ klik kanan pada `http://192.168.1.56` $\rightarrow$ pilih **Clear**.
   - Atau tekan `Ctrl + Shift + Del`, pilih rentang waktu 1 jam terakhir, centang **Cookies and other site data**, lalu klik **Clear data**.

3. **Pastikan Satu Jaringan**:
   Hubungkan laptop panitia dan HP bilik suara ke hotspot/WiFi sekolah yang sama.

---

## 🛡️ Jaminan Keamanan & Aturan Sistem

1. **Zero Client Storage**:
   Aplikasi frontend sama sekali tidak menggunakan `localStorage`, `sessionStorage`, `IndexedDB`, ataupun cookie lokal untuk menyimpan data suara. Semua data bersumber langsung dari MySQL via REST API.
2. **Perlindungan Double-Tap / Suara Ganda**:
   Setiap klik konfirmasi pencoblosan langsung menonaktifkan tombol secara instan dan mengirim token transaksi unik (`request_id` UUID in-memory). Backend memvalidasi keunikan `request_id` sehingga penekanan berulang tidak akan menambah suara ganda.
3. **Penyimpanan Atomik & Urutan Suara**:
   Nomor pemilih (`voter_number`) digenerate secara atomik menggunakan database row lock (`lockForUpdate`), memastikan konsistensi hitungan suara meskipun ratusan suara masuk dalam waktu bersamaan.
4. **Ekspor Excel 2 Sheet**:
   Fitur ekspor di halaman admin menghasilkan file `.xlsx` dengan 2 sheet:
   * **Sheet 1**: Rekapitulasi suara, persentase, dan profil lengkap paslon.
   * **Sheet 2**: Audit log transaksi pemilih lengkap dengan waktu pencoblosan (anonim).
