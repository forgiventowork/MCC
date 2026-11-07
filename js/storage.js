/**
 * Olivafinance - Moluccas Coastal Care (MCC)
 * Layanan Penyimpanan Lokal & Sinkronisasi Google Sheets / Cloud
 */

const StorageService = {
    // Membaca transaksi dari Local Storage
    getTransactions: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Gagal membaca Local Storage:", e);
        }
        return initialTransactions;
    },

    // Menyimpan transaksi ke Local Storage
    saveTransactions: (transactions) => {
        try {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
            return true;
        } catch (e) {
            console.error("Gagal menyimpan ke Local Storage:", e);
            return false;
        }
    },

    // Mendapatkan URL Google Apps Script yang tersimpan
    getGasUrl: () => {
        return localStorage.getItem(STORAGE_KEYS.GAS_URL) || DEFAULT_GAS_URL;
    },

    // Menyimpan URL Google Apps Script baru
    setGasUrl: (url) => {
        if (url) {
            localStorage.setItem(STORAGE_KEYS.GAS_URL, url.trim());
        }
    },

    // Fungsi Hash SHA-256 PIN Keamanan (Standar Boetje-Etty)
    hashPIN: async (pin) => {
        try {
            const msgBuffer = new TextEncoder().encode(String(pin).trim());
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            console.error("Gagal melakukan hash PIN:", e);
            return null;
        }
    },

    // Manajemen PIN Keamanan Admin
    getAdminPinHash: () => {
        try {
            return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN_HASH) || DEFAULT_ADMIN_PIN_HASH;
        } catch (e) {
            return DEFAULT_ADMIN_PIN_HASH;
        }
    },

    setAdminPin: async (newPin) => {
        try {
            if (newPin && String(newPin).trim().length === 6) {
                const hashed = await StorageService.hashPIN(newPin);
                if (hashed) {
                    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN_HASH, hashed);
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.error("Gagal menyimpan PIN Admin:", e);
            return false;
        }
    },

    verifyPin: async (enteredPin) => {
        const hashed = await StorageService.hashPIN(enteredPin);
        const stored = StorageService.getAdminPinHash();
        return hashed === stored;
    },

    isAdminLoggedIn: () => {
        try {
            return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
        } catch (e) {
            return false;
        }
    },

    setAdminLoggedIn: (status) => {
        try {
            if (status) {
                localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
            } else {
                localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
            }
        } catch (e) {
            console.error("Gagal mengubah status sesi admin:", e);
        }
    },

    // Waktu sinkronisasi terakhir
    getLastSync: () => {
        return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || null;
    },

    setLastSync: () => {
        const now = new Date().toLocaleString('id-ID');
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
        return now;
    },

    // Uji koneksi ke endpoint Google Apps Script
    testConnection: async (gasUrl) => {
        const targetUrl = gasUrl || StorageService.getGasUrl();
        try {
            // Coba fetch GET dengan parameter action=ping atau getAllTransactions
            const res = await fetch(`${targetUrl}?action=getAllTransactions`, {
                method: 'GET',
                mode: 'cors'
            });
            if (res.ok) {
                const data = await res.json();
                return { success: true, count: Array.isArray(data) ? data.length : 0 };
            }
            return { success: false, message: `Status respon: ${res.status} (${res.statusText})` };
        } catch (err) {
            return { success: false, message: err.message || "Gagal menghubungi server. Pastikan Web App disetel 'Anyone' (Siapa Saja) pada aksesnya." };
        }
    },

    // =========================================================================
    // INTEGRASI DATABASE SUPABASE (PROJECT INDEPENDEN MCC)
    // =========================================================================
    _supabaseClient: null,

    getSupabaseConfig: () => {
        return {
            url: localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || (typeof DEFAULT_SUPABASE_URL !== 'undefined' ? DEFAULT_SUPABASE_URL : "") || "",
            key: localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY) || (typeof DEFAULT_SUPABASE_ANON_KEY !== 'undefined' ? DEFAULT_SUPABASE_ANON_KEY : "") || ""
        };
    },

    setSupabaseConfig: (url, key) => {
        if (url !== undefined) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, (url || "").trim());
        if (key !== undefined) localStorage.setItem(STORAGE_KEYS.SUPABASE_ANON_KEY, (key || "").trim());
        StorageService._supabaseClient = null; // reset instance
    },

    getSupabaseClient: () => {
        if (StorageService._supabaseClient) return StorageService._supabaseClient;
        const config = StorageService.getSupabaseConfig();
        if (config.url && config.key && window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                StorageService._supabaseClient = window.supabase.createClient(config.url, config.key);
                return StorageService._supabaseClient;
            } catch (e) {
                console.error("Gagal inisialisasi Supabase client:", e);
            }
        }
        return null;
    },

    testSupabaseConnection: async (url, key) => {
        try {
            if (!window.supabase || typeof window.supabase.createClient !== 'function') {
                return { success: false, message: "Library Supabase JS belum siap di browser." };
            }
            const testClient = window.supabase.createClient(url.trim(), key.trim());
            const { data, error } = await testClient
                .from('mcc_transactions')
                .select('id')
                .limit(1);

            if (error) {
                return { success: false, message: error.message || "Tabel mcc_transactions tidak ditemukan atau izin RLS belum diaktifkan." };
            }
            return { success: true, count: data ? data.length : 0 };
        } catch (err) {
            return { success: false, message: err.message || "Gagal menghubungi server Supabase." };
        }
    },

    pullFromSupabase: async () => {
        const client = StorageService.getSupabaseClient();
        if (!client) {
            return { success: false, error: "Koneksi Supabase belum dikonfigurasi." };
        }
        try {
            const { data, error } = await client
                .from('mcc_transactions')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;
            if (!Array.isArray(data)) throw new Error("Format data tidak valid dari server.");

            const sanitized = data.map((item, idx) => ({
                id: String(item.id || `mcc-${idx + 1}`),
                voucherNo: item.voucher_no || `MCC-TX-${String(item.id || idx + 1).padStart(3, '0')}`,
                date: item.date || new Date().toISOString().split('T')[0],
                desc: item.description || item.desc || "Transaksi MCC",
                type: item.type || "Penerimaan",
                category: item.category || IN_CATEGORIES[0],
                restriction: item.restriction || RESTRICTION_TYPES[0],
                amount: parseFloat(item.amount || 0),
                receiptUrl: item.receipt_url || item.receiptUrl || null
            }));

            StorageService.saveTransactions(sanitized);
            StorageService.setLastSync();
            return { success: true, data: sanitized };
        } catch (err) {
            console.error("Gagal menarik data dari Supabase:", err);
            return { success: false, error: err.message };
        }
    },

    pushToSupabase: async (transactions) => {
        const client = StorageService.getSupabaseClient();
        if (!client) {
            return { success: false, error: "Koneksi Supabase belum dikonfigurasi." };
        }
        try {
            const rows = transactions.map(t => {
                const r = {
                    id: String(t.id),
                    voucher_no: t.voucherNo || null,
                    date: t.date,
                    description: t.desc,
                    type: t.type,
                    category: t.category,
                    restriction: t.restriction,
                    amount: parseFloat(t.amount || 0),
                    updated_at: new Date().toISOString()
                };
                if (t.receiptUrl) r.receipt_url = t.receiptUrl;
                return r;
            });

            let { error } = await client
                .from('mcc_transactions')
                .upsert(rows, { onConflict: 'id' });

            if (error && error.message && error.message.includes('receipt_url')) {
                // Retry tanpa kolom receipt_url jika Supabase belum di-alter
                const cleanedRows = rows.map(({ receipt_url, ...rest }) => rest);
                const retry = await client
                    .from('mcc_transactions')
                    .upsert(cleanedRows, { onConflict: 'id' });
                error = retry.error;
            }

            if (error) throw error;
            StorageService.setLastSync();
            return { success: true, count: rows.length };
        } catch (err) {
            console.error("Gagal menyimpan ke Supabase:", err);
            return { success: false, error: err.message };
        }
    },

    syncTransactionToSupabase: async (transaction, action = 'upsert') => {
        const client = StorageService.getSupabaseClient();
        if (!client) return { success: false, skipped: true };

        try {
            if (action === 'delete') {
                const { error } = await client
                    .from('mcc_transactions')
                    .delete()
                    .eq('id', String(transaction.id));
                if (error) throw error;
            } else {
                const row = {
                    id: String(transaction.id),
                    voucher_no: transaction.voucherNo || null,
                    date: transaction.date,
                    description: transaction.desc,
                    type: transaction.type,
                    category: transaction.category,
                    restriction: transaction.restriction,
                    amount: parseFloat(transaction.amount || 0),
                    updated_at: new Date().toISOString()
                };
                if (transaction.receiptUrl) {
                    row.receipt_url = transaction.receiptUrl;
                }

                let { error } = await client
                    .from('mcc_transactions')
                    .upsert(row, { onConflict: 'id' });

                if (error && error.message && error.message.includes('receipt_url')) {
                    delete row.receipt_url;
                    const retry = await client
                        .from('mcc_transactions')
                        .upsert(row, { onConflict: 'id' });
                    error = retry.error;
                }
                if (error) throw error;
            }
            return { success: true };
        } catch (e) {
            console.warn("Supabase background sync notice:", e.message);
            return { success: false, error: e.message };
        }
    },

    // Tarik data terbaru dari Google Sheets via GAS Web App
    pullFromCloud: async (gasUrl) => {
        const targetUrl = gasUrl || StorageService.getGasUrl();
        try {
            const res = await fetch(`${targetUrl}?action=getAllTransactions`, {
                method: 'GET',
                mode: 'cors'
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const json = await res.json();
            
            // Periksa format data (apakah array atau object berformat { data: [...] })
            const dataList = Array.isArray(json) ? json : (json.data && Array.isArray(json.data) ? json.data : null);
            if (!dataList) throw new Error("Format respon server tidak dikenali.");

            // Normalisasi ID dan amount
            const sanitized = dataList.map((item, idx) => ({
                id: item.id || `cloud-${Date.now()}-${idx}`,
                date: item.date || new Date().toISOString().split('T')[0],
                desc: item.desc || item.keterangan || 'Tanpa keterangan',
                type: item.type || item.jenis || 'Pengeluaran',
                category: item.category || item.kategori || EX_CATEGORIES[0],
                restriction: item.restriction || item.pembatasan || RESTRICTION_TYPES[0],
                amount: parseFloat(item.amount || item.nominal || 0)
            }));

            StorageService.saveTransactions(sanitized);
            StorageService.setLastSync();
            return { success: true, data: sanitized };
        } catch (err) {
            console.error("Gagal menarik data dari Cloud:", err);
            return { success: false, error: err.message };
        }
    },

    // Kirim data transaksi lokal ke Google Sheets (Batch Sync)
    pushToCloud: async (transactions, gasUrl) => {
        const targetUrl = gasUrl || StorageService.getGasUrl();
        try {
            const payload = {
                action: 'syncBatchTransactions',
                transactions: transactions
            };

            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors',
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            StorageService.setLastSync();
            return { success: true };
        } catch (err) {
            console.error("Gagal mengirim data ke Cloud:", err);
            return { success: false, error: err.message };
        }
    },

    // Cadangkan semua data ke file JSON lokal
    exportBackupJSON: (transactions) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Backup_Olivafinance_MCC_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    // Reset ke data awal default
    resetToInitial: () => {
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        return initialTransactions;
    },

    // Membaca profil organisasi
    getOrgProfile: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
            if (raw) {
                const profile = JSON.parse(raw);
                let updated = false;
                // Migrasi otomatis ke identitas LSM MCC terbaru
                if (profile.name && profile.name.includes("Yayasan")) {
                    profile.name = profile.name.replace(/Yayasan/gi, "LSM");
                    updated = true;
                }
                if (!profile.address || profile.address.includes("Christina") || profile.address.includes("Tiahahu")) {
                    profile.address = "Jl. Cendrawasih No. 21, Kota Ambon, Maluku - Indonesia";
                    updated = true;
                }
                if (!profile.leaderName || profile.leaderName === "Teria Salhuteru, S.Si." || profile.leaderName.includes("Teria Salhuteru, S.Si.")) {
                    profile.leaderName = "Stefani Teria Salhuteru, S.Pi., M.Si";
                    updated = true;
                }
                if (profile.leaderTitle === "Direktur Eksekutif") {
                    profile.leaderTitle = "Direktur";
                    updated = true;
                }
                if (!profile.financeName || profile.financeName === "Grace Manuputty, S.E.") {
                    profile.financeName = "Anna Valensia C de Fretes, S.E., M.M";
                    updated = true;
                }
                if (profile.financeTitle === "Manajer Keuangan & Akuntansi") {
                    profile.financeTitle = "Bendahara";
                    updated = true;
                }
                if (updated) {
                    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(profile));
                }
                return profile;
            }
        } catch (e) {
            console.error("Gagal membaca profil organisasi:", e);
        }
        return DEFAULT_ORG_PROFILE;
    },

    // Menyimpan profil organisasi
    saveOrgProfile: (profile) => {
        try {
            localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(profile));
            return true;
        } catch (e) {
            console.error("Gagal menyimpan profil organisasi:", e);
            return false;
        }
    },

    // =========================================================================
    // FITUR 2: TUTUP BUKU & PENGUNCIAN PERIODE (PERIOD LOCKING)
    // =========================================================================
    getLockedDate: () => {
        try {
            return localStorage.getItem(STORAGE_KEYS.LOCKED_DATE) || "";
        } catch (e) {
            return "";
        }
    },

    setLockedDate: (dateStr) => {
        try {
            if (dateStr && String(dateStr).trim()) {
                localStorage.setItem(STORAGE_KEYS.LOCKED_DATE, String(dateStr).trim());
            } else {
                localStorage.removeItem(STORAGE_KEYS.LOCKED_DATE);
            }
            return true;
        } catch (e) {
            console.error("Gagal menyimpan tanggal tutup buku:", e);
            return false;
        }
    },

    isDateLocked: (dateStr) => {
        if (!dateStr) return false;
        const lockedDate = StorageService.getLockedDate();
        if (!lockedDate) return false;
        return dateStr <= lockedDate;
    },

    // =========================================================================
    // FITUR 3: RIWAYAT PERUBAHAN & AUDIT TRAIL
    // =========================================================================
    getAuditLogs: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error("Gagal membaca audit log:", e);
        }
        return [];
    },

    addAuditLog: (entry) => {
        try {
            const logs = StorageService.getAuditLogs();
            const newLog = {
                id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                timestamp: new Date().toISOString(),
                action: entry.action || 'MUTASI',
                voucherNo: entry.voucherNo || '-',
                desc: entry.desc || '',
                amount: parseFloat(entry.amount || 0),
                details: entry.details || '',
                user: 'Bendahara (Admin)'
            };
            const updated = [newLog, ...logs].slice(0, 150);
            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));

            // Sync ke Supabase mcc_audit_logs jika tabel tersedia
            const client = StorageService.getSupabaseClient();
            if (client) {
                client.from('mcc_audit_logs').insert([{
                    id: newLog.id,
                    timestamp: newLog.timestamp,
                    action: newLog.action,
                    voucher_no: newLog.voucherNo,
                    description: newLog.desc,
                    amount: newLog.amount,
                    details: newLog.details
                }]).then(({ error }) => {
                    // Silently ignore if table not created yet
                }).catch(() => {});
            }

            return newLog;
        } catch (e) {
            console.error("Gagal menambah audit log:", e);
            return null;
        }
    },

    clearAuditLogs: () => {
        try {
            localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Pastikan tersedia di scope window / browser global
if (typeof window !== 'undefined') {
    window.StorageService = StorageService;
}
