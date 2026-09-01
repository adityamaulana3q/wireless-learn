# WirelessLearn

Media pembelajaran interaktif untuk siswa SMK — materi **Jaringan Nirkabel: Klasifikasi Berdasarkan Jangkauan** (WPAN, WLAN, WMAN, WWAN).

## Cara Menjalankan

Cukup buka file `index.html` langsung di browser (Chrome/Edge/Firefox). Tidak perlu server, backend, atau instalasi tambahan.

Koneksi internet dibutuhkan hanya untuk memuat font (Google Fonts) dan ikon (Font Awesome) dari CDN. Jika offline, website tetap berjalan dengan font fallback bawaan sistem.

## Struktur File

```
wireless-learning/
├── index.html      → struktur & konten seluruh halaman
├── style.css       → tema dark navy + glassmorphism, animasi, responsive
├── script.js       → navigasi, simulator, game, quiz, localStorage
└── assets/         → folder cadangan untuk gambar/ikon/audio tambahan
```

## Fitur Utama

- Navbar sticky + hamburger menu di mobile
- Hero dengan ilustrasi SVG animasi jaringan wireless
- Tujuan pembelajaran, pengantar materi, dan 4 kartu klasifikasi (WPAN/WLAN/WMAN/WWAN)
- Visual perbandingan jangkauan (lingkaran interaktif)
- Halaman detail tiap kategori jaringan
- **Wireless Range Simulator** — pilih kategori, klik perangkat untuk tooltip penjelasan
- **Flashcard** yang dapat dibalik
- **Game Drag & Drop** memasangkan teknologi ke kategori jaringan yang tepat (mendukung klik/tap untuk mobile)
- **Mini game "Siapa Aku?"** — tebak jaringan dari petunjuk bertahap
- **Studi kasus interaktif** dengan feedback langsung
- **Quiz 15 soal** pilihan ganda dengan progress bar, feedback, skor, dan kategori penilaian
- **Dashboard progress** yang menyimpan status materi, skor quiz, dan skor game menggunakan `localStorage`
- Tabel perbandingan responsif
- Toggle suara ON/OFF (default OFF) menggunakan Web Audio API
- Tombol "Kembali ke Atas", scroll progress bar, dan animasi reveal saat scroll
- Aksesibilitas dasar: semantic HTML, aria-label, kontras warna, focus state, dukungan keyboard

## Sistem Penilaian Quiz

- Benar = 10 poin, Salah = 0 poin, skor maksimum 100
- 90–100 = Sangat Baik
- 80–89 = Baik
- 70–79 = Cukup
- < 70 = Perlu Belajar Lagi

## Catatan

Angka jangkauan (WPAN ± 10 m, WLAN < 100 m, WMAN < 50 km, WWAN nasional–global) adalah ilustrasi pembelajaran sederhana. Jangkauan sebenarnya di lapangan dapat berbeda tergantung teknologi, frekuensi, daya pancar, kondisi lingkungan, antena, dan infrastruktur.

© 2026 WirelessLearn
