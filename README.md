# Olivafinance — Moluccas Coastal Care (ISAK 35)

Aplikasi Web Manajemen Keuangan dan Pelaporan Akuntansi Entitas Nirlaba (NGO) berstandar **ISAK 35** (*Interpretasi Standar Akuntansi Keuangan 35*), dirancang khusus untuk **Moluccas Coastal Care (MCC)**.

Aplikasi ini dapat dijalankan secara mandiri (*standalone*), mendukung penyimpanan lokal (*offline-first* dengan IndexedDB/LocalStorage), dan memiliki fitur **Dual Sync** ke **Google Sheets** melalui Google Apps Script Web App.

---

## 🌟 Fitur Utama

1. **Dashboard Eksekutif (Financial Overview)**:
   - 4 Metrik Utama: *Kas & Setara Kas*, *Aset Neto Tanpa Pembatasan*, *Aset Neto Dengan Pembatasan*, dan *Surplus / (Defisit) Berjalan*.
   - Grafik Tren Arus Kas Bulanan (Penerimaan vs Pengeluaran) interaktif dengan Chart.js.
   - Diagram Distribusi Pembatasan Sumber Dana ISAK 35.
   - Tabel Aktivitas Transaksi Terkini.
   - Ekspor ringkasan Dashboard ke format PDF.

2. **Buku Jurnal Harian (Transaction Management)**:
   - Pencatatan transaksi kas masuk & kas keluar dengan validasi lengkap.
   - Kategori akun otomatis menyesuaikan standar ISAK 35.
   - Fitur **Undo & Redo** tak terbatas (*Time-Travel State*).
   - Pencarian instan dan filter multi-kriteria (berdasarkan jenis aliran kas dan status pembatasan dana).
   - Ekspor daftar transaksi langsung ke file **Excel (.xlsx)** dan cetak.

3. **Laporan Akuntansi Formal ISAK 35**:
   - **Laporan Posisi Keuangan (Neraca)**: Aset Lancar, Aset Tetap, Liabilitas, dan Aset Neto.
   - **Laporan Penghasilan Komprehensif**: Rincian pendapatan dan beban terpilah menurut pembatasan dana (Tanpa vs Dengan Pembatasan).
   - **Laporan Perubahan Aset Neto**: Rekonsiliasi saldo awal hingga saldo akhir periode.
   - **Laporan Arus Kas (Metode Langsung)**: Arus kas aktivitas operasi dan investasi aset tetap.
   - **Catatan Atas Laporan Keuangan (CALK)**: Informasi profil entitas MCC dan kebijakan akuntansi.
   - Multi-format Export: **Cetak Resmi (Print)**, **PDF (Format A4)**, **Word (.doc)**, dan **Excel (.xlsx)**.

4. **Dual Sync & Manajemen Data Cloud**:
   - Terintegrasi langsung dengan **Google Sheets** via Google Apps Script Web App API.
   - Tarik data (*Pull*) dari Google Sheets atau kirim data lokal (*Push*) ke Google Sheets.
   - Fitur Cadangkan Data (*Backup*) dan Pulihkan (*Restore*) dalam format file JSON.
   - Uji koneksi API langsung dari antarmuka aplikasi.

---

## 📁 Struktur Direktori

```text
g:\My Drive\Website\MCC\
├── index.html                  # Halaman utama aplikasi (Responsif, ringan & mandiri)
├── README.md                   # Dokumentasi dan panduan penggunaan
├── package.json                # Skrip runner lokal & build
├── build.js                    # Kompiler otomatis JSX ke JS standar (Zero-config)
├── css/
│   └── styles.css              # Styling kustom & tata letak cetak A4 akuntansi
├── js/
│   ├── config.js               # Konfigurasi akun ISAK 35 & konstanta sistem
│   ├── data.js                 # Helper format rupiah/tanggal & data transaksi awal
│   ├── storage.js              # Service Local Storage, Supabase DB & Cloud Sync API
│   ├── export.js               # Engine ekspor dokumen PDF, Word, Excel & Print
│   ├── app.jsx                 # Source code React (JSX) yang mudah diedit
│   └── app.js                  # Versi kompilasi siap jalan instan di browser
├── supabase_setup.sql          # Script SQL mandiri untuk Supabase (Tabel mcc_transactions & RLS)
├── vercel.json                 # Konfigurasi deployment & clean URL routing Vercel
└── google-apps-script/
    └── Code.gs                 # Kode backend Apps Script siap pasang di Google Sheets
```

---

## 🗄️ Panduan Database Supabase (Proyek Terpisah Khusus MCC)

Proyek ini sepenuhnya terpisah dan independen dari sistem lain. Untuk menghubungkan ke database Supabase Anda sendiri:

1. Buat project baru di [Supabase](https://supabase.com) (misal: `mcc-finance`).
2. Masuk ke menu **SQL Editor**, buka file `supabase_setup.sql`, salin seluruh isinya, lalu klik **Run**.
   - Ini akan membuat tabel `mcc_transactions` dengan keamanan Row Level Security (RLS) serta mengisi 7 transaksi awal MCC.
3. Masuk ke menu **Project Settings** > **API** di Supabase, lalu salin:
   - **Project URL**
   - **anon public Key**
4. Buka aplikasi di browser, buka menu **Pengaturan** (ikon gerigi / Admin), pilih tab **Supabase DB**, tempel URL dan Anon Key, lalu klik **Simpan Kredensial** dan **Uji Koneksi**.
5. Klik **Upload Lokal (Push)** untuk memastikan semua data tersimpan di Cloud.

---

## 🚀 Panduan Masuk ke GitHub & Deploy Vercel (Domain Kustom)

### 1. Masuk ke GitHub
```bash
# Inisialisasi git dan commit (sudah disiapkan):
git init
git add .
git commit -m "feat: setup Olivafinance MCC dengan ISAK 35, Supabase, PIN auth, dan Vercel"

# Hubungkan ke repository GitHub baru Anda:
git remote add origin https://github.com/<username-anda>/<nama-repo-mcc>.git
git branch -M main
git push -u origin main
```

### 2. Deploy ke Vercel & Pasang Domain Kustom
1. Masuk ke [Vercel Dashboard](https://vercel.com).
2. Klik **Add New Project** > **Import Git Repository**.
3. Pilih repository GitHub MCC Anda.
4. Pada Framework Preset, pilih **Other** (karena aplikasi ini adalah static web HTML/JS).
5. Klik **Deploy**. Website akan langsung aktif dalam hitungan detik!
6. Untuk memasang custom domain:
   - Masuk ke tab **Settings** > **Domains** di project Vercel Anda.
   - Tambahkan domain/subdomain Anda (misal: `keuangan.moluccascoastalcare.org` atau domain kustom Anda).
   - Ikuti konfigurasi DNS (CNAME / A Record) yang diberikan Vercel.

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Langsung Buka di Browser (Tanpa Instalasi)
Anda dapat langsung membuka file `index.html` dengan klik ganda di file manager atau menggunakan peramban web (Google Chrome, Microsoft Edge, Firefox).

### Opsi 2: Menggunakan Server Lokal
Jika Anda memiliki Node.js terpasang di komputer:
```bash
# Jalankan server lokal instan
npm start
# atau
npx serve .
```
Lalu buka alamat yang muncul di terminal (biasanya `http://localhost:3000`).

---

## 🔗 Panduan Menghubungkan ke Google Sheets

Untuk mengaktifkan sinkronisasi dengan Google Sheets Anda sendiri:

1. Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru di Google Drive Anda.
2. Beri nama spreadsheet, misalnya: `Database Keuangan MCC`.
3. Buka menu **Ekstensi (Extensions)** > **Apps Script**.
4. Buka file `google-apps-script/Code.gs` dari folder proyek ini, lalu salin (*copy*) seluruh isinya ke editor Apps Script.
5. Klik **Terapkan (Deploy)** > **Penerapan baru (New deployment)**.
6. Pilih jenis penerapan: **Aplikasi web (Web app)**.
7. Konfigurasikan:
   - **Jalankan sebagai (Execute as)**: `Saya (Me)`
   - **Siapa yang memiliki akses (Who has access)**: `Siapa saja (Anyone)`
8. Klik **Terapkan (Deploy)** dan salin URL Web App yang dihasilkan.
9. Buka aplikasi Olivafinance, klik menu **Cloud Sync (Pengaturan)** di pojok kanan atas, masukkan URL Web App tersebut, lalu klik **Simpan** dan **Uji Koneksi API**.

---

## 🌐 Panduan Deploy ke Hosting Publik

Aplikasi ini berarsitektur murni klien (*client-side*), sehingga dapat di-hosting secara gratis di:
- **GitHub Pages**: Cukup unggah repository ini dan aktifkan GitHub Pages dari branch `main`.
- **Vercel**: Hubungkan repository GitHub atau jalankan `npx vercel` di terminal.
- **Netlify**: *Drag and drop* folder `MCC` ke dashboard Netlify.
- **cPanel / Web Hosting Biasa**: Unggah seluruh file ke folder `public_html`.

---

© 2026 Olivafinance untuk Moluccas Coastal Care (MCC).
