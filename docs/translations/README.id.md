# Bahasa Indonesia

Catatan: Berkas ini diterjemahkan mesin; perlu pemeriksaan manusia.

# Sunshine Care Log

> Alat pelacakan perawatan harian gratis dan sumber terbuka untuk pasien lansia — dibuat untuk pengasuh keluarga.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## Apa ini?

Aplikasi web dwibahasa (Bahasa Indonesia / Chinese Tradisional) untuk membantu pengasuh keluarga melacak data kesehatan harian pasien lansia di rumah—terutama yang memerlukan pemantauan cairan.

Tidak perlu instalasi. Berjalan di browser ponsel mana pun. Data tersinkron ke Google Sheets melalui Google Apps Script.

---

## Fitur

- Pelacakan asupan cairan (air, minuman obat, suplemen, makanan) dengan target harian & progress
- Pelacakan keluaran cairan (volume urine & warna, buang air besar)
- Algoritma target urine cerdas yang disesuaikan untuk diuretik
- Peringatan kelebihan cairan (jika total asupan > 1.200 c.c.)
- Pencatatan latihan, pengukuran tekanan darah & detak jantung
- Sistem peringatan konstipasi dengan instruksi keselamatan dwibahasa
- Pelacakan status obat, pengingat waktu, sinkronisasi cloud ke Google Sheets

---

## Untuk siapa?

Pengasuh keluarga, rumah dengan banyak pengasuh, pasien yang butuh pemantauan cairan ketat (gagal jantung, dialisis, pemulihan pasca operasi).

---

## Teknologi

Frontend: HTML + JavaScript + Tailwind CSS
Backend: Google Apps Script
Database: Google Sheets
Hosting: GitHub Pages

---

## Pengaturan / Self-hosting

1. Fork repo ini
2. Deploy backend Google Apps Script sendiri (atur GAS_URL di index.html)
3. Buat Google Sheet untuk data
4. Update GAS_URL dan SPREADSHEET_URL di index.html
5. Aktifkan GitHub Pages pada fork Anda

---

## Lisensi

MIT © 2026 anwer3712
