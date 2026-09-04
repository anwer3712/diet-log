# Log Penjagaan Sunshine / Sunshine Care Log

> Alat penjejakan penjagaan harian sumber terbuka dan percuma untuk pesakit warga emas — untuk penjaga keluarga.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## Apa ini?

Aplikasi web dwibahasa (Bahasa Cina Tradisional 🇹🇼 / Indonesia 🇮🇩) yang dirancang untuk membantu **penjaga keluarga** menjejaki data kesihatan harian pesakit warga emas di rumah — khususnya mereka yang menghidapi penyakit kronik yang memerlukan pengurusan cecair yang ketat (kegagalan jantung, dialisis, pemulihan pasca pembedahan).

Tiada pemasangan diperlukan. Berfungsi di mana-mana pelayar telefon pintar. Data disinkronkan dengan Google Sheets melalui Google Apps Script.

---

## Ciri-ciri

- **Penjejakan pengambilan cecair** — air, minuman ubat, suplemen pemakanan, makanan (dengan sasaran harian & bar kemajuan)
- **Penjejakan keluaran cecair** — isipadu air kencing + warna, pergerakan usus dengan status
- **Algoritma sasaran air kencing pintar** — mengira secara automatik keluaran air kencing yang dijangka berdasarkan sasaran pengambilan air, disesuaikan untuk ubat diuretik (julat ×1.1–1.5) vs. tiada ubat (julat ×0.4–0.6)
- **Amaran beban berlebihan cecair** — amaran merah apabila jumlah pengambilan melebihi 1,200 c.c.
- **Penelog latihan** — angkat botol, tekan kaki, bengkok lutut, bantuan berdiri (dengan senarai semak protokol keselamatan)
- **Tekanan darah & kadar degupan jantung** — pengukuran pagi dan malam dengan panduan pengukuran
- **Sistem amaran sembelit** — mencetuskan amaran secara automatik setiap 2 jam antara 60–72 jam selepas pergerakan usus terakhir, dengan arahan keselamatan dwibahasa yang melarang penggunaan enema tanpa pengawasan
- **Penjejakan status ubat** — diuretik dan pencahar, berdegil di awan
- **Sistem pengingat berasaskan masa** — pengingat pintar untuk pengukuran BP, slot latihan, dan pemeriksaan air kencing sebelum tidur
- **Sinkronisasi awan** — semua data disimpan ke Google Sheets melalui Google Apps Script; menyokong isi rumah penjaga berganda
- **Antara muka optimistik** — rekod muncul secara serta-merta tanpa menunggu respons pelayan
- **Pengingat pembersihan mingguan** — jadual terbina dalam untuk tugas kebersihan rumah

---

## Siapa untuk?

- Ahli keluarga yang menjaga ibu bapa atau datuk nenek warga emas di rumah
- Isi rumah dengan berbilang penjaga bergilir (terutamanya merentasi halangan bahasa)
- Pesakit dengan keadaan yang memerlukan pemantauan cecair yang ketat (kegagalan jantung, dialisis, pemulihan pasca pembedahan)

---

## Tindanan Teknologi

| Lapisan | Teknologi |
|-------|-----------|
| Frontend | HTML + JavaScript + Tailwind CSS vanilla |
| Backend | Google Apps Script (tanpa pelayan) |
| Pangkalan data | Google Sheets |
| Hos | GitHub Pages (percuma) |

Tiada rangka kerja. Tiada alat binaan. Tiada kebergantungan untuk dipasang. Dibuka terus dalam mana-mana pelayar.

---

## Persediaan / Hos Diri

1. Garpu repositori ini
2. Gunakan backend Google Apps Script anda sendiri (lihat `GAS_URL` dalam `index.html`)
3. Buat Google Sheet untuk penyimpanan data
4. Kemas kini pemalar `GAS_URL` dan `SPREADSHEET_URL` dalam `index.html`
5. Dayakan GitHub Pages pada garpu anda → selesai

---

## Tangkapan skrin

| Penjejakan harian | Entri berpandu dwibahasa | Analisis trend |
|---|---|---|
| Log penjagaan harian: jalur kemajuan, sasaran pengambilan cecair dengan bar kemajuan, pemilihan kategori air/ubat/pemakanan/makanan | Skrin entri berpandu menunjukkan arahan dalam Bahasa Cina Tradisional dan Indonesia sebelah menyebelah, dengan langkah bernombor | Halaman analisis trend kesihatan dengan pemilih julat 7/14/30 hari dan lima belas carta pembolehubah silang yang boleh dipilih |
| Jalur kemajuan, sasaran cecair & penelog kategori | Setiap rentetan dalam Bahasa Cina Tradisional dan Indonesia, langkah demi langkah | 15 carta pembolehubah silang (7/14/30 hari) |

*（Demo langsung: https://anwer3712.github.io/diet-log/ — tangkapan skrin diambil pada skrin pandangan telefon 414×896）*

---

## Motivasi

Dibina daripada keperluan. Apabila ahli keluarga memerlukan penjagaan rumah 24/7 dengan pengurusan cecair yang ketat, aplikasi sedia ada terlalu rumit, hanya Bahasa Inggeris, atau memerlukan langganan bulanan. Alat ini bertujuan memberikan penyelesaian mudah, percuma, dan berbilang bahasa supaya penjaga boleh memberi tumpuan kepada pesakit, bukan aplikasi.

---

## Peta Jalan

Penambahbaikan yang dirancang — masing-masing adalah isu terbuka, maklum balas komuniti dialu-alukan:

- [ ] [#15](https://github.com/anwer3712/diet-log/issues/15) **Analisis kesihatan berbantu AI** — integrasikan Claude untuk mengesan trend abnormal merentasi data pengambilan cecair, keluaran air kencing, dan tekanan darah, dan terjemahkan nombor mentah ke panduan penjagaan bahasa biasa
- [ ] [#16](https://github.com/anwer3712/diet-log/issues/16) **Soal & jawab penjaga AI** — biarkan penjaga bertanya soalan dalam bahasa mereka sendiri ("airnya gelap hari ini, patutkah saya bimbang?") berdasarkan data pesakit yang sebenarnya dicatat
- [ ] [#17](https://github.com/anwer3712/diet-log/issues/17) **Pasangan bahasa tambahan** — Inggeris, Vietnam, Tagalog, Thai untuk isi rumah penjagaan multikultural
- [ ] [#18](https://github.com/anwer3712/diet-log/issues/18) **Mod luar talian** — caching pekerja perkhidmatan untuk sambungan tidak stabil
- [ ] [#19](https://github.com/anwer3712/diet-log/issues/19) **Laporan mingguan yang boleh dicetak** — ringkasan satu halaman untuk kunjungan doktor
- [ ] [#20](https://github.com/anwer3712/diet-log/issues/20) **Sokongan berbilang pesakit** — untuk isi rumah atau kemudahan penjagaan kecil yang menjejaki lebih daripada seorang

---

## Sumbangan

Permintaan tarik dialu-alukan — lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk cara membantu (sumbangan terjemahan sangat dihargai). Projek ini mengikuti [Kod Tingkah Laku](CODE_OF_CONDUCT.md).

Jika anda menjaga ahli keluarga warga emas dan memerlukan ciri — [buka isu](https://github.com/anwer3712/diet-log/issues).

---

## Keselamatan

Menemui kerentanan? Sila laporkan secara tertutup — lihat [SECURITY.md](SECURITY.md).
Jangan buka isu awam dan jangan pernah sertakan data pesakit sebenar dalam laporan.

---

## Lesen

MIT © 2026 anwer3712
