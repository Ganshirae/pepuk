# TANITERANG: Platform Transparansi Pupuk Bersubsidi (Pilot NTB)

> **Kompetisi:** MIA 2026 — Web In Action (WIA)  
> **Tema:** *Designing Digital Futures: Powering Public Transparency*

---

## 1. Judul Proyek dan Deskripsi Singkat

**TANITERANG** adalah platform keterbukaan publik yang menyajikan transparansi data alokasi, realisasi, dan Harga Eceran Tertinggi (HET) pupuk bersubsidi resmi untuk wilayah Nusa Tenggara Barat (NTB). Platform ini menyediakan kanal aduan warga tanpa akun dan tanpa syarat NIK/KTP, di mana laporan hanya akan dinyatakan selesai setelah dikonfirmasi langsung oleh pelapor (*two-sided resolution*).

---

## 2. Tech Stack

Pengembangan antarmuka TANITERANG mengedepankan performa tinggi, aksesibilitas visual WCAG 2.1 AA, dan keandalan di perangkat ponsel *entry-level* dengan sinyal terbatas:

* **Core & Framework:** [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) (Single Page Application, Fast HMR, Modular Architecture)
* **Styling & Design System:** [Tailwind CSS v3](https://tailwindcss.com/) dengan palet token warna ramah buta warna (*Colorblind-safe* HSL & Emerald `#1F6B3A`, Amber `#F2B01E`)
* **Peta Spasial & Choropleth:** [Leaflet.js 1.9](https://leafletjs.com/) dengan batas wilayah GeoJSON terkompresi (<35 KB) untuk 10 Kabupaten/Kota NTB
* **Ikonografi & Visual:** [Lucide React](https://lucide.dev/) (Ikon SVG garis konsisten tanpa emoji mentah)
* **Penyimpanan & Keamanan Klien:** 
  * Browser Web Crypto API (SHA-256 Hashing untuk kode pelacakan rahasia)
  * Web Storage (`localStorage` API) untuk penyimpanan draf otomatis (*offline resilience*) dan pelacakan riwayat aduan lokal tanpa login.

---

## 3. Panduan Menjalankan Proyek (How to Run)

Ikuti langkah-langkah berikut untuk menguji dan menjalankan proyek di komputer lokal:

### 3.1. Prasyarat Sistem
* **Node.js:** Versi 18.x, 20.x, atau 22.x+
* **Package Manager:** `npm` (atau `pnpm` / `yarn`)
* **Git:** Versi terbaru

### 3.2. Kloning Repositori
```bash
git clone https://github.com/Ganshirae/pepuk.git
cd pepuk
```

### 3.3. Pemasangan Dependensi
Pasang semua pustaka yang dibutuhkan dengan perintah:
```bash
npm install
```

### 3.4. Konfigurasi Berkas Lingkungan (*Environment*)
Platform pada Fase 1 ini sepenuhnya berjalan *client-side* menggunakan data terbuka resmi NTB dan `localStorage` engine, sehingga **tidak memerlukan konfigurasi file `.env` khusus** untuk pengujian lokal.

### 3.5. Menjalankan Server Pengembangan Lokal (*Dev Server*)
Jalankan dev server dengan perintah:
```bash
npm run dev
```
Setelah server aktif, buka peramban (*browser*) Anda pada tautan:
```
http://localhost:5173/
```

### 3.6. Validasi Build Produksi
Untuk memastikan tidak ada kesalahan sintaks atau kompilasi bundel:
```bash
npm run build
npm run preview
```

---

## 4. Status Progres Pengerjaan (First Draft Submission)

Seluruh target modul utama **Fase 1 (M0 – M4)** beserta penyempurnaan pengalaman pengguna telah selesai dibangun:

| Kode Modul | Nama Modul | Status | Rincian Fitur yang Selesai Dibangun |
| :--- | :--- | :---: | :--- |
| **M0** | **Beranda Utama** | ✅ Rampung | Ringkasan metrik alokasi, realisasi, dan % penyerapan NTB; kartu navigasi cepat 10 wilayah; 3 pilar alur kerja transparansi; banner jaminan privasi tanpa NIK/KTP; tombol aksi besar Lapor & Lacak. |
| **M1** | **Info Pupuk: Data & Peta** | ✅ Rampung | Peta Leaflet interaktif choropleth NTB (filter layer % realisasi, ton alokasi, dan aduan); daftar alternatif wilayah ramah layar seluler (360px); modal rincian wilayah per jenis pupuk (Urea, NPK, Organik); tabel HET resmi Permentan No. 01/2024; fitur unduh data format CSV. |
| **M2** | **Formulir Lapor Masalah** | ✅ Rampung | Wizard bertahap 4 langkah (Masalah $\rightarrow$ Wilayah $\rightarrow$ Bukti Foto & Harga $\rightarrow$ Kirim); komparasi otomatis selisih harga terhadap HET resmi; unggah maksimal 3 foto dengan validasi ukuran (<2MB); auto-save draf lokal; captcha anti-spam; kontak opsional. |
| **M3** | **Bukti & Kode Rahasia** | ✅ Rampung | Pembuatan ID Publik (format `TT-2024-XXXX`) dan Kode Rahasia unik (format `TR-XXXX-XXXX`); fungsi salin kode satu ketukan; peringatan tegas penyimpanan kode; tautan instan ke modul pelacakan. |
| **M4** | **Lacak Laporan** | ✅ Rampung | Pencarian status dengan kode rahasia atau ID publik; timeline vertikal riwayat disposisi; countdown batas waktu respons (SLA); **Fitur Inovasi:** mekanisme *two-sided resolution* (tombol konfirmasi pelapor "Sudah Selesai" atau "Buka Kembali"); kode demo siap uji. |
| **M7** | **Laporan Saya** *(Quick Win)* | ✅ Rampung | Daftar riwayat aduan yang pernah dikirim dari peramban perangkat lokal tanpa membutuhkan login; akses lacak cepat; opsi pembersihan riwayat lokal. |

---

## 5. Sumber Data & Regulasi Acuan

1. **Harga Eceran Tertinggi (HET):** Peraturan Menteri Pertanian (Permentan) No. 01 Tahun 2024 jo. Kepmentan No. 249/2024 (Urea: Rp1.800/kg, NPK: Rp1.840/kg, Pupuk Organik: Rp640/kg).
2. **Alokasi Pupuk NTB:** Data Publikasi Dinas Pertanian dan Perkebunan Provinsi NTB & Sistem e-Alokasi Kementerian Pertanian Republik Indonesia.
3. **Penyaluran Resmi:** Mekanisme penebusan berbasis digital *i-Pubers* (PT Pupuk Indonesia).