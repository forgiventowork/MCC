/**
 * Olivafinance - Moluccas Coastal Care (MCC)
 * Konfigurasi Akun Standar ISAK 35 & Variabel Sistem
 */

// Kategori Penerimaan Sesuai ISAK 35
const IN_CATEGORIES = [
    "Pendapatan Hibah/Donor",
    "Pendapatan Penghasilan Jasa/Barang",
    "Pendapatan Kontribusi Personil",
    "Pendapatan Lainnya"
];

// Kategori Pengeluaran / Beban Sesuai ISAK 35
const EX_CATEGORIES = [
    "Biaya Personil (Gaji Staff/Enumerator)",
    "Beban Profesional",
    "Beban Pembelian Aset",
    "Biaya Perjalanan",
    "Biaya Bantuan Program",
    "Biaya Publikasi",
    "Biaya Administrasi Kantor",
    "Biaya Penyusutan",
    "Biaya Amortisasi",
    "Biaya Lainnya"
];

// Jenis Pembatasan Sumber Dana (ISAK 35)
const RESTRICTION_TYPES = [
    "Tanpa Pembatasan",
    "Dengan Pembatasan"
];

// Jenis Aliran Transaksi Kas
const TRANSACTIONS_TYPES = [
    "Penerimaan",
    "Pengeluaran"
];

// Profil Organisasi Default
const DEFAULT_ORG_PROFILE = {
    name: "Yayasan Moluccas Coastal Care (MCC)",
    legal: "SK Kemenkumham RI No. AHU-0018921.AH.01.04.Tahun 2020",
    address: "Jl. Christina Martha Tiahahu No. 14, Kota Ambon, Maluku - Indonesia",
    phone: "+62 812-4000-8899",
    email: "finance@moluccascoastalcare.org",
    leaderName: "Teria Salhuteru, S.Si.",
    leaderTitle: "Direktur Eksekutif",
    financeName: "Grace Manuputty, S.E.",
    financeTitle: "Manajer Keuangan & Akuntansi"
};

// URL Default Web App Google Apps Script MCC
const DEFAULT_GAS_URL = "https://script.google.com/a/macros/dharmais.co.id/s/AKfycbzZ94lD6DARDpBxv7G4-1O7Cu6U00r3QKO7EBRB27UR5WjtXArKJ39ixw7YmEkQYJ8/exec";

// Kunci & Konfigurasi Supabase MCC (Proyek Terpisah)
const DEFAULT_SUPABASE_URL = "https://qjzywjowebjkkmirdzkw.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_kscuSlIO2zHkseDtucdvCA_yrponQk4";

// Kunci Penyimpanan Local Storage (Spesifik MCC)
const STORAGE_KEYS = {
    TRANSACTIONS: "mcc_transactions_v5",
    GAS_URL: "mcc_gas_api_url",
    SUPABASE_URL: "mcc_supabase_url",
    SUPABASE_ANON_KEY: "mcc_supabase_anon_key",
    LAST_SYNC: "mcc_last_sync_timestamp",
    ORGANIZATION: "mcc_org_profile",
    ADMIN_SESSION: "mcc_admin",
    ADMIN_PIN_HASH: "mcc_admin_pin_hash"
};

const DEFAULT_ADMIN_PIN = "123456";
const DEFAULT_ADMIN_PIN_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"; // 123456

// Pastikan tersedia di scope window / browser global
if (typeof window !== 'undefined') {
    window.IN_CATEGORIES = IN_CATEGORIES;
    window.EX_CATEGORIES = EX_CATEGORIES;
    window.TRANSACTIONS_TYPES = TRANSACTIONS_TYPES;
    window.DEFAULT_ORG_PROFILE = DEFAULT_ORG_PROFILE;
    window.DEFAULT_GAS_URL = DEFAULT_GAS_URL;
    window.DEFAULT_SUPABASE_URL = DEFAULT_SUPABASE_URL;
    window.DEFAULT_SUPABASE_ANON_KEY = DEFAULT_SUPABASE_ANON_KEY;
    window.DEFAULT_ADMIN_PIN = DEFAULT_ADMIN_PIN;
    window.DEFAULT_ADMIN_PIN_HASH = DEFAULT_ADMIN_PIN_HASH;
    window.STORAGE_KEYS = STORAGE_KEYS;
}
