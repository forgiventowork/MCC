-- =========================================================================
-- SCRIPT SETUP DATABASE SUPABASE - YAYASAN MOLUCCAS COASTAL CARE (MCC)
-- Standar Pelaporan Keuangan Entitas Nirlaba (ISAK 35)
-- Project Independen / Terpisah Khusus Olivafinance MCC
-- =========================================================================

-- 1. Buat Tabel Transaksi Keuangan MCC (mcc_transactions)
CREATE TABLE IF NOT EXISTS mcc_transactions (
    id TEXT PRIMARY KEY,
    voucher_no TEXT,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Penerimaan', 'Pengeluaran')),
    category TEXT NOT NULL,
    restriction TEXT NOT NULL CHECK (restriction IN ('Tanpa Pembatasan', 'Dengan Pembatasan')),
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index untuk mempercepat query
CREATE INDEX IF NOT EXISTS idx_mcc_tx_date ON mcc_transactions(date);
CREATE INDEX IF NOT EXISTS idx_mcc_tx_type ON mcc_transactions(type);

-- 2. Aktifkan Keamanan Row Level Security (RLS)
ALTER TABLE mcc_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Buat Kebijakan Akses (Policy) untuk Web App (Anon Key)
DROP POLICY IF EXISTS "Izinkan baca transaksi untuk umum" ON mcc_transactions;
CREATE POLICY "Izinkan baca transaksi untuk umum"
    ON mcc_transactions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Izinkan tambah transaksi" ON mcc_transactions;
CREATE POLICY "Izinkan tambah transaksi"
    ON mcc_transactions FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Izinkan perbarui transaksi" ON mcc_transactions;
CREATE POLICY "Izinkan perbarui transaksi"
    ON mcc_transactions FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Izinkan hapus transaksi" ON mcc_transactions;
CREATE POLICY "Izinkan hapus transaksi"
    ON mcc_transactions FOR DELETE
    USING (true);

-- 4. Tabel Profil Organisasi MCC
CREATE TABLE IF NOT EXISTS mcc_organization (
    id INT PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL,
    legal TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    leader_name TEXT,
    leader_title TEXT,
    finance_name TEXT,
    finance_title TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE mcc_organization ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan akses profil organisasi" ON mcc_organization;
CREATE POLICY "Izinkan akses profil organisasi"
    ON mcc_organization FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Insert Profil Default MCC
INSERT INTO mcc_organization (id, name, legal, address, phone, email, leader_name, leader_title, finance_name, finance_title)
VALUES (
    1,
    'Yayasan Moluccas Coastal Care (MCC)',
    'SK Kemenkumham RI No. AHU-0018921.AH.01.04.Tahun 2020',
    'Jl. Christina Martha Tiahahu No. 14, Kota Ambon, Maluku - Indonesia',
    '+62 812-4000-8899',
    'finance@moluccascoastalcare.org',
    'Teria Salhuteru, S.Si.',
    'Direktur Eksekutif',
    'Grace Manuputty, S.E.',
    'Manajer Keuangan & Akuntansi'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    legal = EXCLUDED.legal,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

-- 6. Insert Data Awal (7 Transaksi Asli Pembukuan MCC)
INSERT INTO mcc_transactions (id, voucher_no, date, description, type, category, restriction, amount)
VALUES
    ('1', 'MCC-BKM-202610-001', '2026-10-01', 'Hibah Program Konservasi Pesisir', 'Penerimaan', 'Pendapatan Hibah/Donor', 'Dengan Pembatasan', 150000000),
    ('2', 'MCC-BKM-202610-002', '2026-10-05', 'Donasi Publik Reguler', 'Penerimaan', 'Pendapatan Lainnya', 'Tanpa Pembatasan', 25000000),
    ('3', 'MCC-BKK-202610-003', '2026-10-10', 'Gaji Staf Oktober', 'Pengeluaran', 'Biaya Personil (Gaji Staff/Enumerator)', 'Tanpa Pembatasan', 12000000),
    ('4', 'MCC-BKK-202610-004', '2026-10-15', 'Pembelian Bibit Mangrove', 'Pengeluaran', 'Biaya Bantuan Program', 'Dengan Pembatasan', 35000000),
    ('5', 'MCC-BKK-202610-005', '2026-10-20', 'Sewa Kantor Tahunan', 'Pengeluaran', 'Biaya Administrasi Kantor', 'Tanpa Pembatasan', 20000000),
    ('6', 'MCC-BKK-202610-006', '2026-10-25', 'Perjalanan Dinas Pemantauan', 'Pengeluaran', 'Biaya Perjalanan', 'Dengan Pembatasan', 5000000),
    ('7', 'MCC-BKK-202611-007', '2026-11-02', 'Pembelian Laptop Inventaris', 'Pengeluaran', 'Beban Pembelian Aset', 'Tanpa Pembatasan', 15000000)
ON CONFLICT (id) DO NOTHING;

-- 7. Kolom Tambahan: Lampiran Bukti Transaksi (Kuitansi / Nota Digital)
ALTER TABLE mcc_transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- 8. Tabel Riwayat Audit (Audit Trail Perubahan Transaksi)
CREATE TABLE IF NOT EXISTS mcc_audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    action TEXT NOT NULL,
    voucher_no TEXT,
    description TEXT,
    amount NUMERIC(15, 2) DEFAULT 0,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE mcc_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan akses audit log untuk umum" ON mcc_audit_logs;
CREATE POLICY "Izinkan akses audit log untuk umum"
    ON mcc_audit_logs FOR ALL
    USING (true)
    WITH CHECK (true);

-- 9. Query verifikasi untuk memastikan setup sukses
SELECT count(*) AS total_transaksi, 
       sum(CASE WHEN type = 'Penerimaan' THEN amount ELSE -amount END) AS saldo_bersih 
FROM mcc_transactions;
