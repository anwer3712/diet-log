# Sunshine Care Log / 陽光照護日誌

> Alat pelacakan perawatan harian gratis dan sumber terbuka untuk pasien lanjut usia — dirancang untuk pengasuh keluarga.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## Apa ini?

Aplikasi web dua bahasa (Bahasa Cina Tradisional 🇹🇼 / Bahasa Indonesia 🇮🇩) yang dirancang untuk membantu **pengasuh keluarga** melacak data kesehatan harian pasien lanjut usia di rumah — terutama mereka yang menderita penyakit kronis yang memerlukan manajemen cairan ketat (gagal jantung, dialisis, pemulihan pasca operasi).

Tidak perlu instalasi. Bekerja di browser ponsel pintar apa pun. Data tersinkronisasi dengan Google Sheets melalui Google Apps Script.

---

## Fitur utama

- **Pelacakan asupan cairan** — air, minuman obat, suplemen nutrisi, makanan (dengan target harian & bilah progres)
- **Pelacakan produksi cairan** — volume urin + warna, gerakan usus dengan status
- **Algoritma target urin cerdas** — secara otomatis menghitung produksi urin yang diharapkan berdasarkan target asupan air, disesuaikan untuk obat diuretik (rentang ×1,1–1,5) vs. tanpa obat (rentang ×0,4–0,6)
- **Peringatan kelebihan beban cairan** — peringatan merah ketika total asupan melebihi 1.200 c.c.
- **Pencatatan olahraga** — angkat botol, tekan kaki, tekuk lutut, bantuan berdiri (dengan daftar periksa protokol keselamatan)
- **Tekanan darah & denyut jantung** — pengukuran pagi dan malam dengan panduan pengukuran
- **Sistem peringatan sembelit** — secara otomatis memicu peringatan setiap 2 jam antara 60–72 jam setelah gerakan usus terakhir, dengan instruksi keselamatan dua bahasa yang melarang penggunaan enema tanpa pengawasan
- **Pelacakan status obat** — obat diuretik dan pencahar, bertahan di cloud
- **Sistem pengingat berbasis waktu** — pengingat cerdas untuk pengukuran BP, slot olahraga, dan pemeriksaan urin sebelum tidur
- **Sinkronisasi cloud** — semua data disimpan ke Google Sheets melalui Google Apps Script; mendukung rumah tangga dengan banyak pengasuh
- **UI optimis** — catatan muncul secara instan tanpa menunggu respons server
- **Pengingat pembersihan mingguan** — jadwal bawaan untuk tugas kebersihan rumah tangga

---

## Siapa ini untuk?

- Anggota keluarga yang merawat orang tua atau kakek-nenek lanjut usia di rumah
- Rumah tangga dengan banyak pengasuh bergantian (terutama di seluruh hambatan bahasa)
- Pasien dengan kondisi yang memerlukan pemantauan cairan ketat (gagal jantung, dialisis, pemulihan pasca operasi)

---

## Stack teknologi

| Lapisan | Teknologi |
|-------|----------|
| Frontend | HTML + JavaScript + Tailwind CSS vanilla |
| Backend | Google Apps Script (tanpa server) |
| Database | Google Sheets |
| Hosting | GitHub Pages (gratis) |

Tanpa framework. Tanpa alat build. Tanpa dependensi untuk diinstal. Terbuka langsung di browser apa pun.

---

## Pengaturan / Self-Hosting

1. Fork repositori ini
2. Terapkan backend Google Apps Script Anda sendiri (lihat `GAS_URL` di `index.html`)
3. Buat Google Sheet untuk penyimpanan data
4. Perbarui konstanta `GAS_URL` dan `SPREADSHEET_URL` di `index.html`
5. Aktifkan GitHub Pages di fork Anda → selesai

---

## Tangkapan layar

| Pelacakan harian | Entri dua bahasa | Analisis tren |
|---|---|---|
| Log perawatan harian: bilah progres, target asupan cairan dengan bilah progres, pilihan kategori air/obat/nutrisi/makanan | Layar entri terpandu yang menampilkan instruksi dalam bahasa Cina tradisional dan Indonesia berdampingan, dengan langkah bernomor | Halaman analisis tren kesehatan dengan pemilih rentang 7/14/30 hari dan lima belas bagan variabel silang yang dapat dipilih |
| Bilah progres, target cairan & pencatatan kategori | Setiap string dalam bahasa Cina tradisional dan Indonesia, langkah demi langkah | 15 bagan variabel silang (7/14/30 hari) |

*（Demo langsung: https://anwer3712.github.io/diet-log/ — tangkapan layar diambil pada viewport ponsel 414×896）*

---

## Motivasi

Dibangun dari kebutuhan. Ketika anggota keluarga memerlukan perawatan di rumah 24/7 dengan manajemen cairan ketat, aplikasi yang ada terlalu rumit, hanya bahasa Inggris, atau memerlukan langganan bulanan. Tujuan alat ini adalah: menyediakan solusi sederhana, gratis, dan multibahasa sehingga pengasuh dapat fokus pada pasien, bukan aplikasi.

---

## Roadmap

Peningkatan yang direncanakan — masing-masing adalah masalah terbuka, masukan komunitas diterima:

- [ ] [#15](https://github.com/anwer3712/diet-log/issues/15) **Analisis kesehatan berbantuan AI** — integrasikan Claude untuk mendeteksi tren abnormal di seluruh data asupan cairan, produksi urin, dan tekanan darah, dan terjemahkan angka mentah menjadi panduan perawatan dalam bahasa biasa
- [ ] [#16](https://github.com/anwer3712/diet-log/issues/16) **Tanya jawab pengasuh AI** — biarkan pengasuh mengajukan pertanyaan dalam bahasa mereka sendiri ("urinnya gelap hari ini, haruskah saya khawatir?") berdasarkan data aktual pasien yang tercatat
- [ ] [#17](https://github.com/anwer3712/diet-log/issues/17) **Pasangan bahasa tambahan** — Inggris, Vietnam, Tagalog, Thai untuk rumah tangga perawatan multikultural
- [ ] [#18](https://github.com/anwer3712/diet-log/issues/18) **Mode offline** — caching pekerja layanan untuk koneksi yang tidak stabil
- [ ] [#19](https://github.com/anwer3712/diet-log/issues/19) **Laporan mingguan yang dapat dicetak** — ringkasan satu halaman untuk kunjungan dokter
- [ ] [#20](https://github.com/anwer3712/diet-log/issues/20) **Dukungan multi-pasien** — untuk rumah tangga atau fasilitas perawatan kecil yang melacak lebih dari satu orang

---

## Berkontribusi

Pull request diterima — lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk mengetahui cara membantu (kontribusi terjemahan sangat dihargai). Proyek ini mengikuti [Kode Etik](CODE_OF_CONDUCT.md).

Jika Anda merawat anggota keluarga lanjut usia dan membutuhkan fitur — [buka masalah](https://github.com/anwer3712/diet-log/issues).

---

## Keamanan

Menemukan kerentanan? Silakan laporkan secara pribadi — lihat [SECURITY.md](SECURITY.md).
Jangan buka masalah publik, dan jangan pernah sertakan data pasien nyata dalam laporan.

---

## Lisensi

MIT © 2026 anwer3712