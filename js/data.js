/**
 * Olivafinance - Moluccas Coastal Care (MCC)
 * Data Transaksi Asli Google Sheets & Helper Akuntansi
 */

// Format angka ke format Rupiah standar akuntansi Indonesia
function formatRupiah(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return "Rp 0";
    return "Rp " + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Format tanggal ISO (YYYY-MM-DD) ke tampilan lokal Indonesia (e.g. 01 Okt 2026)
function formatDateId(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// 7 Transaksi Kas Nyata Google Sheets MCC (Sesuai Database Pengguna)
const initialTransactions = [
    { 
        id: "1", 
        voucherNo: "MCC-BKM-202610-001",
        date: "2026-10-01", 
        desc: "Hibah Program Konservasi Pesisir", 
        type: "Penerimaan", 
        category: "Pendapatan Hibah/Donor", 
        restriction: "Dengan Pembatasan", 
        amount: 150000000 
    },
    { 
        id: "2", 
        voucherNo: "MCC-BKM-202610-002",
        date: "2026-10-05", 
        desc: "Donasi Publik Reguler", 
        type: "Penerimaan", 
        category: "Pendapatan Lainnya", 
        restriction: "Tanpa Pembatasan", 
        amount: 25000000 
    },
    { 
        id: "3", 
        voucherNo: "MCC-BKK-202610-003",
        date: "2026-10-10", 
        desc: "Gaji Staf Oktober", 
        type: "Pengeluaran", 
        category: "Biaya Personil (Gaji Staff/Enumerator)", 
        restriction: "Tanpa Pembatasan", 
        amount: 12000000 
    },
    { 
        id: "4", 
        voucherNo: "MCC-BKK-202610-004",
        date: "2026-10-15", 
        desc: "Pembelian Bibit Mangrove", 
        type: "Pengeluaran", 
        category: "Biaya Bantuan Program", 
        restriction: "Dengan Pembatasan", 
        amount: 35000000 
    },
    { 
        id: "5", 
        voucherNo: "MCC-BKK-202610-005",
        date: "2026-10-20", 
        desc: "Sewa Kantor Tahunan", 
        type: "Pengeluaran", 
        category: "Biaya Administrasi Kantor", 
        restriction: "Tanpa Pembatasan", 
        amount: 20000000 
    },
    { 
        id: "6", 
        voucherNo: "MCC-BKK-202610-006",
        date: "2026-10-25", 
        desc: "Perjalanan Dinas Pemantauan", 
        type: "Pengeluaran", 
        category: "Biaya Perjalanan", 
        restriction: "Dengan Pembatasan", 
        amount: 5000000 
    },
    { 
        id: "7", 
        voucherNo: "MCC-BKK-202611-007",
        date: "2026-11-02", 
        desc: "Pembelian Laptop Inventaris", 
        type: "Pengeluaran", 
        category: "Beban Pembelian Aset", 
        restriction: "Tanpa Pembatasan", 
        amount: 15000000 
    }
];

// Pastikan tersedia di scope window / browser global
if (typeof window !== 'undefined') {
    window.initialTransactions = initialTransactions;
    window.formatRupiah = formatRupiah;
    window.formatDateId = formatDateId;
}
