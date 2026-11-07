/**
 * Olivafinance - Moluccas Coastal Care (MCC)
 * Modul Ekspor Laporan: PDF Eksekutif Berstandar ISAK 35, Word (.doc), Excel (.xlsx), dan Cetak
 * Didesain khusus untuk kebutuhan presentasi manajemen, dewan pembina, auditor, dan mitra donor internasional.
 */

// SVG Logo Resmi Moluccas Coastal Care (MCC)
const MCC_SVG_LOGO = `
<svg viewBox="0 0 40 40" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#f0fdf4"/>
    <path d="M20 32 C19 22 9 18 8 8 C16 6 20 18 20 32 Z" fill="#00a884" />
    <path d="M20 32 C21 22 31 18 32 8 C24 6 20 18 20 32 Z" fill="#0284c7" />
    <circle cx="20" cy="8" r="2.8" fill="#00a884" />
</svg>
`;

// Helper Pemformat Rupiah
function formatRupiahHelper(amount) {
    if (typeof window.formatRupiah === 'function') return window.formatRupiah(amount);
    if (amount === undefined || amount === null || isNaN(amount)) return "Rp 0";
    return "Rp " + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Helper Pemformat Tanggal Indonesia
function formatDateHelper(dateStr) {
    if (typeof window.formatDateId === 'function') return window.formatDateId(dateStr);
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// Helper Notifikasi Toast Status Ekspor
function showExportToast(message, type = 'info') {
    let toast = document.getElementById('export-status-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'export-status-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.zIndex = '99999';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '12px';
        toast.style.fontFamily = '"Plus Jakarta Sans", sans-serif';
        toast.style.fontSize = '12px';
        toast.style.fontWeight = '700';
        toast.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15)';
        toast.style.transition = 'all 0.3s ease';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '8px';
        document.body.appendChild(toast);
    }

    if (type === 'loading') {
        toast.style.backgroundColor = '#0f172a';
        toast.style.color = '#ffffff';
        toast.style.border = '1px solid #334155';
        toast.innerHTML = `<svg style="animation: spin 1s linear infinite; width: 14px; height: 14px; margin-right: 6px;" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.3"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> ${message}`;
    } else if (type === 'success') {
        toast.style.backgroundColor = '#065f46';
        toast.style.color = '#ffffff';
        toast.style.border = '1px solid #059669';
        toast.innerHTML = `✓ ${message}`;
        setTimeout(() => { if (toast) toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2500);
    } else {
        toast.style.backgroundColor = '#991b1b';
        toast.style.color = '#ffffff';
        toast.style.border = '1px solid #dc2626';
        toast.innerHTML = `✕ ${message}`;
        setTimeout(() => { if (toast) toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
    }
}

const ExportService = {
    /**
     * Generator PDF Eksekutif Buku Jurnal Umum (A4 Landscape Modern)
     * Format presentasi lengkap dengan Kop Surat Resmi, Ringkasan KPI, Tabel Ledger, Lembar Pengesahan, dan Footer.
     */
    exportJournalPDF: async (transactions = [], options = {}) => {
        const filename = options.filename || 'Buku_Jurnal_MCC';
        const org = options.org || (window.StorageService ? window.StorageService.getOrgProfile() : (window.DEFAULT_ORG_PROFILE || {}));
        const periodText = options.periodText || `Periode: s.d. ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        
        // Perhitungan Statistik Keuangan Eksekutif
        let sumIn = 0;
        let sumOut = 0;
        transactions.forEach(t => {
            const amt = parseFloat(t.amount) || 0;
            if (t.type === 'Penerimaan') sumIn += amt;
            else if (t.type === 'Pengeluaran') sumOut += amt;
        });
        const netBalance = sumIn - sumOut;

        const originalCursor = document.body.style.cursor;
        document.body.style.cursor = 'wait';
        showExportToast('Membuat PDF Eksekutif Buku Jurnal...', 'loading');

        try {
            if (!window.html2canvas || !window.jspdf) {
                throw new Error("Pustaka jspdf / html2canvas belum siap.");
            }

            // Pembagian Halaman Cerdas (Smart Pagination)
            // Halaman 1 memuat Kop, Metadata, 4 KPI Cards, Tabel Transaksi (hingga 8 baris)
            // Jika transaksi <= 8 baris, langsung sertakan baris Rekapitulasi + Tanda Tangan pada halaman 1 (1 Halaman Penuh Sempurna)
            // Jika transaksi > 8 baris, halaman berikutnya memuat Running Header dan baris lanjutan
            const FIRST_PAGE_LIMIT = 8;
            const SUBSEQUENT_PAGE_LIMIT = 12;

            const pagesData = [];
            if (transactions.length <= FIRST_PAGE_LIMIT) {
                pagesData.push({
                    pageIndex: 1,
                    isFirst: true,
                    isLast: true,
                    items: transactions
                });
            } else {
                pagesData.push({
                    pageIndex: 1,
                    isFirst: true,
                    isLast: false,
                    items: transactions.slice(0, FIRST_PAGE_LIMIT)
                });
                let offset = FIRST_PAGE_LIMIT;
                let pageNumber = 2;
                while (offset < transactions.length) {
                    const chunk = transactions.slice(offset, offset + SUBSEQUENT_PAGE_LIMIT);
                    const isLast = (offset + SUBSEQUENT_PAGE_LIMIT >= transactions.length);
                    pagesData.push({
                        pageIndex: pageNumber,
                        isFirst: false,
                        isLast: isLast,
                        items: chunk
                    });
                    offset += SUBSEQUENT_PAGE_LIMIT;
                    pageNumber++;
                }
            }

            const totalPages = pagesData.length;

            // Kontainer terisolasi di DOM untuk perenderan PDF
            const sandbox = document.createElement('div');
            sandbox.id = 'pdf-export-sandbox';
            sandbox.style.position = 'fixed';
            sandbox.style.left = '0';
            sandbox.style.top = '0';
            sandbox.style.zIndex = '-99999';
            sandbox.style.pointerEvents = 'none';
            sandbox.style.background = '#ffffff';
            document.body.appendChild(sandbox);

            const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const printTimestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

            const pdf = new window.jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            // Bangun dan tangkap setiap halaman
            for (let i = 0; i < pagesData.length; i++) {
                const page = pagesData[i];
                const pageEl = document.createElement('div');
                
                // Dimensi proporsional presisi A4 Landscape (1122px x 793px)
                pageEl.style.width = '1122px';
                pageEl.style.minHeight = '793px';
                pageEl.style.height = '793px';
                pageEl.style.boxSizing = 'border-box';
                pageEl.style.padding = '26px 36px';
                pageEl.style.backgroundColor = '#ffffff';
                pageEl.style.color = '#0f172a';
                pageEl.style.fontFamily = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                pageEl.style.display = 'flex';
                pageEl.style.flexDirection = 'column';
                pageEl.style.justifyContent = 'space-between';
                pageEl.style.position = 'relative';

                // Isi Konten Halaman
                let pageHtml = `
                    <style>
                        * { box-sizing: border-box; }
                        .mcc-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
                    </style>
                    <div>
                `;

                // Garis Aksen Gradien Atas (Branding MCC: Emerald to Ocean Cyan)
                pageHtml += `
                    <div style="height: 4px; background: linear-gradient(90deg, #00a884 0%, #0284c7 100%); border-radius: 2px; margin-bottom: 14px;"></div>
                `;

                if (page.isFirst) {
                    // KOP SURAT RESMI EKSEKUTIF (Halaman 1)
                    pageHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2px solid #0f172a; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <div style="flex-shrink: 0;">
                                    ${MCC_SVG_LOGO}
                                </div>
                                <div>
                                    <h1 style="font-size: 16px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2;">
                                        ${org.name || 'LSM MOLUCCAS COASTAL CARE (MCC)'}
                                    </h1>
                                    <p style="font-size: 9.5px; font-weight: 800; color: #00a884; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 0.8px;">
                                        Pusat Konservasi Pesisir dan Laut Maluku • Sistem Informasi Keuangan ISAK 35
                                    </p>
                                    <p style="font-size: 8.5px; color: #64748b; margin: 3px 0 0 0;">
                                        ${org.legal || 'SK Kemenkumham RI: AHU-0018921.AH.01.04.Tahun 2020 • NPWP: 94.882.112.4-941.000'}
                                    </p>
                                    <p style="font-size: 8.5px; color: #64748b; margin: 1px 0 0 0;">
                                        ${org.address || 'Jl. Cendrawasih No. 21, Kota Ambon, Maluku - Indonesia'} • Telp: ${org.phone || '+62 812-4000-8899'}
                                    </p>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <span style="display: inline-block; padding: 3px 8px; background: #0f172a; color: #ffffff; border-radius: 6px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;">
                                    STANDAR ISAK 35
                                </span>
                                <h2 style="font-size: 16px; font-weight: 900; color: #0f172a; margin: 4px 0 2px 0; text-transform: uppercase; letter-spacing: -0.2px;">
                                    BUKU JURNAL UMUM MUTASI KAS
                                </h2>
                                <p style="font-size: 9.5px; font-weight: 700; color: #0284c7; margin: 0;">
                                    ${periodText}
                                </p>
                                <p style="font-size: 8px; color: #94a3b8; margin: 2px 0 0 0;">
                                    Dicetak: ${printTimestamp} WIT
                                </p>
                            </div>
                        </div>

                        <!-- 4 KARTU RINGKASAN EKSEKUTIF (KPI CARDS) -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px;">
                            <div style="background: #f0fdf4; border: 1px solid #86efac; border-left: 4px solid #16a34a; border-radius: 8px; padding: 8px 12px;">
                                <div style="font-size: 8px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL PENERIMAAN (DEBIT)</div>
                                <div class="mcc-mono" style="font-size: 14px; font-weight: 900; color: #15803d; margin-top: 2px;">+${formatRupiahHelper(sumIn)}</div>
                            </div>
                            <div style="background: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 8px; padding: 8px 12px;">
                                <div style="font-size: 8px; font-weight: 800; color: #be123c; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL PENGELUARAN (KREDIT)</div>
                                <div class="mcc-mono" style="font-size: 14px; font-weight: 900; color: #e11d48; margin-top: 2px;">-${formatRupiahHelper(sumOut)}</div>
                            </div>
                            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 8px; padding: 8px 12px;">
                                <div style="font-size: 8px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px;">ARUS KAS BERSIH (NET)</div>
                                <div class="mcc-mono" style="font-size: 14px; font-weight: 900; color: #0284c7; margin-top: 2px;">${formatRupiahHelper(netBalance)}</div>
                            </div>
                            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #64748b; border-radius: 8px; padding: 8px 12px;">
                                <div style="font-size: 8px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL MUTASI TERCATAT</div>
                                <div class="mcc-mono" style="font-size: 14px; font-weight: 900; color: #334155; margin-top: 2px;">${transactions.length} Mutasi Kas</div>
                            </div>
                        </div>
                    `;
                } else {
                    // RUNNING HEADER (Halaman Lanjutan)
                    pageHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 2px solid #0f172a; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 20px; height: 20px;">${MCC_SVG_LOGO}</div>
                                <span style="font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase;">
                                    ${org.name || 'LSM MOLUCCAS COASTAL CARE'} • BUKU JURNAL UMUM (LANJUTAN)
                                </span>
                            </div>
                            <div style="font-size: 9px; color: #64748b; font-weight: 700;">
                                ${periodText} • Halaman ${page.pageIndex} dari ${totalPages}
                            </div>
                        </div>
                    `;
                }

                // TABEL LEDGER TRANSAKSI EKSEKUTIF
                pageHtml += `
                    <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #cbd5e1; margin-bottom: 8px;">
                        <thead>
                            <tr style="background: #0f172a; color: #ffffff;">
                                <th style="padding: 7px 8px; text-align: center; width: 32px; font-weight: 800; letter-spacing: 0.5px; border-right: 1px solid #334155;">NO</th>
                                <th style="padding: 7px 10px; text-align: left; width: 125px; font-weight: 800; letter-spacing: 0.5px; border-right: 1px solid #334155;">TANGGAL & NO. BUKTI</th>
                                <th style="padding: 7px 10px; text-align: left; font-weight: 800; letter-spacing: 0.5px; border-right: 1px solid #334155;">KETERANGAN & URAIAN MUTASI</th>
                                <th style="padding: 7px 10px; text-align: left; width: 180px; font-weight: 800; letter-spacing: 0.5px; border-right: 1px solid #334155;">KATEGORI AKUN (ISAK 35)</th>
                                <th style="padding: 7px 10px; text-align: center; width: 130px; font-weight: 800; letter-spacing: 0.5px; border-right: 1px solid #334155;">PEMBATASAN DANA</th>
                                <th style="padding: 7px 10px; text-align: right; width: 130px; font-weight: 800; letter-spacing: 0.5px; border-right: 1px solid #334155;">DEBIT (MASUK)</th>
                                <th style="padding: 7px 10px; text-align: right; width: 130px; font-weight: 800; letter-spacing: 0.5px;">KREDIT (KELUAR)</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                const startIdx = (page.pageIndex === 1) ? 0 : (FIRST_PAGE_LIMIT + (page.pageIndex - 2) * SUBSEQUENT_PAGE_LIMIT);

                if (page.items.length === 0) {
                    pageHtml += `
                        <tr>
                            <td colspan="7" style="padding: 24px; text-align: center; color: #94a3b8; font-style: italic;">
                                Tidak ada mutasi kas untuk periode ini.
                            </td>
                        </tr>
                    `;
                } else {
                    page.items.forEach((tx, idx) => {
                        const rowNum = startIdx + idx + 1;
                        const isEven = idx % 2 === 0;
                        const rowBg = isEven ? '#ffffff' : '#f8fafc';
                        
                        const isRestricted = (tx.restriction || '').toLowerCase().includes('dengan');
                        const badgeBg = isRestricted ? '#fef3c7' : '#ecfdf5';
                        const badgeColor = isRestricted ? '#92400e' : '#047857';
                        const badgeBorder = isRestricted ? '#fde68a' : '#a7f3d0';

                        const isIn = tx.type === 'Penerimaan';
                        const isOut = tx.type === 'Pengeluaran';

                        pageHtml += `
                            <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 6.5px 8px; text-align: center; color: #64748b; font-weight: 700; border-right: 1px solid #e2e8f0;">${rowNum}</td>
                                <td style="padding: 6.5px 10px; border-right: 1px solid #e2e8f0; white-space: nowrap;">
                                    <div class="mcc-mono" style="font-weight: 700; color: #0f172a;">${formatDateHelper(tx.date)}</div>
                                    ${tx.voucherNo ? `<div class="mcc-mono" style="font-size: 7.5px; color: #64748b; background: #e2e8f0; padding: 1px 4px; border-radius: 3px; display: inline-block; margin-top: 2px;">${tx.voucherNo}</div>` : ''}
                                </td>
                                <td style="padding: 6.5px 10px; font-weight: 700; color: #1e293b; border-right: 1px solid #e2e8f0;">
                                    ${tx.desc || '-'}
                                </td>
                                <td style="padding: 6.5px 10px; color: #475569; font-weight: 600; border-right: 1px solid #e2e8f0;">
                                    ${tx.category || '-'}
                                </td>
                                <td style="padding: 6.5px 10px; text-align: center; border-right: 1px solid #e2e8f0;">
                                    <span style="display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 8px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; white-space: nowrap;">
                                        ${tx.restriction || 'Tanpa Pembatasan'}
                                    </span>
                                </td>
                                <td class="mcc-mono" style="padding: 6.5px 10px; text-align: right; border-right: 1px solid #e2e8f0; font-weight: 800; color: ${isIn ? '#15803d' : '#94a3b8'};">
                                    ${isIn ? formatRupiahHelper(tx.amount) : '-'}
                                </td>
                                <td class="mcc-mono" style="padding: 6.5px 10px; text-align: right; font-weight: 800; color: ${isOut ? '#be123c' : '#94a3b8'};">
                                    ${isOut ? formatRupiahHelper(tx.amount) : '-'}
                                </td>
                            </tr>
                        `;
                    });
                }

                // Baris Total Rekapitulasi (Hanya pada Halaman Terakhir)
                if (page.isLast) {
                    pageHtml += `
                        <tr style="background: #f1f5f9; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; font-weight: 900;">
                            <td colspan="5" style="padding: 8px 12px; text-align: right; font-size: 9.5px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                                TOTAL MUTASI KAS (PERIODE INI) :
                            </td>
                            <td class="mcc-mono" style="padding: 8px 10px; text-align: right; font-size: 10.5px; color: #15803d; border-right: 1px solid #cbd5e1;">
                                ${formatRupiahHelper(sumIn)}
                            </td>
                            <td class="mcc-mono" style="padding: 8px 10px; text-align: right; font-size: 10.5px; color: #be123c;">
                                ${formatRupiahHelper(sumOut)}
                            </td>
                        </tr>
                    `;
                }

                pageHtml += `
                        </tbody>
                    </table>
                `;

                // LEMBAR PENGESAHAN RESMI (Tanda Tangan Pengurus pada Halaman Terakhir)
                if (page.isLast) {
                    pageHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                            <!-- Bagian Kiri: Pembuat Laporan -->
                            <div style="text-align: center; width: 240px;">
                                <p style="font-size: 8.5px; color: #64748b; margin: 0 0 2px 0;">Dibuat Oleh:</p>
                                <p style="font-size: 9.5px; font-weight: 800; color: #0f172a; margin: 0;">${org.financeTitle || 'Bendahara'}</p>
                                <div style="height: 48px; display: flex; align-items: center; justify-content: center;">
                                    <div style="border: 1.5px dashed #00a884; border-radius: 8px; padding: 3px 10px; color: #00a884; font-size: 7.5px; font-weight: 900; letter-spacing: 0.5px; transform: rotate(-3deg);">
                                        VERIFIED • ISAK 35
                                    </div>
                                </div>
                                <p style="font-size: 9.5px; font-weight: 900; color: #0f172a; text-decoration: underline; margin: 0;">${org.financeName || 'Anna Valensia C de Fretes, S.E., M.M'}</p>
                                <p style="font-size: 8px; color: #64748b; margin: 1px 0 0 0;">Departemen Finansial</p>
                            </div>

                            <!-- Bagian Tengah: Stempel Akuntabilitas & Verifikasi -->
                            <div style="text-align: center; width: 220px;">
                                <div style="display: inline-block; border: 2px solid #0f172a; border-radius: 10px; padding: 5px 12px; background: #f8fafc;">
                                    <div style="font-size: 8px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">DOKUMEN SAH & AKUNTABEL</div>
                                    <div style="font-size: 7px; color: #64748b; margin-top: 1px;">Sistem Informasi Keuangan Eksekutif</div>
                                    <div style="font-size: 6.5px; font-weight: 800; color: #00a884; margin-top: 1px;">ISAK 35 COMPLIANT</div>
                                </div>
                            </div>

                            <!-- Bagian Kanan: Mengetahui / Direktur -->
                            <div style="text-align: center; width: 240px;">
                                <p style="font-size: 8.5px; color: #64748b; margin: 0 0 2px 0;">Ambon, ${todayFormatted}</p>
                                <p style="font-size: 9.5px; font-weight: 800; color: #0f172a; margin: 0;">Mengetahui & Menyetujui,</p>
                                <p style="font-size: 8.5px; font-weight: 700; color: #475569; margin: 0;">${org.leaderTitle || 'Direktur'}</p>
                                <div style="height: 48px; display: flex; align-items: center; justify-content: center;">
                                    <div style="border: 1.5px dashed #0284c7; border-radius: 8px; padding: 3px 10px; color: #0284c7; font-size: 7.5px; font-weight: 900; letter-spacing: 0.5px; transform: rotate(3deg);">
                                        APPROVED & SIGNED
                                    </div>
                                </div>
                                <p style="font-size: 9.5px; font-weight: 900; color: #0f172a; text-decoration: underline; margin: 0;">${org.leaderName || 'Stefani Teria Salhuteru, S.Pi., M.Si'}</p>
                                <p style="font-size: 8px; color: #64748b; margin: 1px 0 0 0;">LSM Moluccas Coastal Care</p>
                            </div>
                        </div>
                    `;
                }

                pageHtml += `</div>`; // Tutup div utama konten atas

                // FOOTER RESMI DOKUMEN (Bagian Bawah Halaman)
                pageHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid #cbd5e1; font-size: 8px; color: #64748b; margin-top: auto;">
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <span>Dokumen Resmi Sistem Informasi Keuangan <strong>OlivaFinance</strong> • LSM Moluccas Coastal Care (MCC)</span>
                        </div>
                        <div style="font-style: italic;">
                            Sah tanpa tanda tangan basah bila terverifikasi dalam database sistem keuangan
                        </div>
                        <div class="mcc-mono" style="font-weight: 700; color: #0f172a;">
                            Halaman <strong>${page.pageIndex}</strong> dari <strong>${totalPages}</strong>
                        </div>
                    </div>
                `;

                pageEl.innerHTML = pageHtml;
                sandbox.appendChild(pageEl);

                // Tangkap menggunakan html2canvas dengan resolusi tinggi (scale: 2)
                const canvas = await window.html2canvas(pageEl, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    logging: false,
                    windowWidth: 1122
                });

                const imgData = canvas.toDataURL('image/png');

                if (i > 0) {
                    pdf.addPage('a4', 'landscape');
                }

                // 297mm x 210mm adalah ukuran standar A4 Landscape
                pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
            }

            // Simpan file PDF
            pdf.save(`${filename}.pdf`);

            // Bersihkan sandbox
            document.body.removeChild(sandbox);
            document.body.style.cursor = originalCursor;
            showExportToast('PDF Eksekutif Buku Jurnal berhasil diunduh!', 'success');

        } catch (error) {
            console.error("Gagal membuat PDF Buku Jurnal:", error);
            const sb = document.getElementById('pdf-export-sandbox');
            if (sb) document.body.removeChild(sb);
            document.body.style.cursor = originalCursor;
            showExportToast('Gagal memproses PDF: ' + (error.message || 'Kesalahan sistem'), 'error');
        }
    },

    /**
     * Ekspor Laporan Keuangan Standar ISAK 35 ke Format PDF (A4 Portrait Eksekutif)
     * Untuk Laporan Posisi Keuangan, Aktivitas, Perubahan Aset Neto, Arus Kas, dan CALK
     */
    toPDF: async (elementId, filename = "Laporan_Keuangan_MCC") => {
        // Jika yang diekspor adalah tabel jurnal umum, otomatis alihkan ke generator PDF Eksekutif!
        if (elementId === 'journalTableContainer' || filename.includes('Buku_Jurnal')) {
            if (window._currentJournalTransactions && window._currentJournalTransactions.length > 0) {
                return ExportService.exportJournalPDF(window._currentJournalTransactions, { filename });
            }
            // Ekstraksi data dari tabel DOM jika variabel tidak tersedia
            const table = document.querySelector('#journalTableContainer table');
            if (table) {
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                const extracted = [];
                rows.forEach((tr, i) => {
                    const cells = tr.querySelectorAll('td');
                    if (cells.length >= 6) {
                        const dateText = cells[0].querySelector('span')?.innerText || cells[0].innerText;
                        const voucher = cells[0].querySelector('.font-mono-num')?.innerText || '';
                        const desc = cells[1].querySelector('p')?.innerText || cells[1].innerText;
                        const category = cells[2].innerText.trim();
                        const restriction = cells[3].innerText.trim();
                        const inText = cells[4].innerText.replace(/[^0-9]/g, '');
                        const outText = cells[5].innerText.replace(/[^0-9]/g, '');
                        
                        let type = 'Penerimaan';
                        let amount = 0;
                        if (inText && parseInt(inText) > 0) {
                            type = 'Penerimaan';
                            amount = parseInt(inText);
                        } else if (outText && parseInt(outText) > 0) {
                            type = 'Pengeluaran';
                            amount = parseInt(outText);
                        }

                        if (desc && desc !== 'Tidak ada transaksi kas') {
                            extracted.push({
                                id: String(i + 1),
                                date: dateText,
                                voucherNo: voucher,
                                desc: desc,
                                category: category,
                                restriction: restriction,
                                type: type,
                                amount: amount
                            });
                        }
                    }
                });

                if (extracted.length > 0) {
                    return ExportService.exportJournalPDF(extracted, { filename });
                }
            }
        }

        const element = document.getElementById(elementId);
        if (!element) {
            alert("Elemen laporan tidak ditemukan.");
            return;
        }

        const noPrintElements = element.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.style.display = 'none');

        const originalCursor = document.body.style.cursor;
        document.body.style.cursor = 'wait';
        showExportToast('Memproses PDF Laporan...', 'loading');

        try {
            if (window.html2canvas && window.jspdf) {
                const canvas = await window.html2canvas(element, { 
                    scale: 2, 
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                const pageWidth = 210;
                const pageHeight = 297;
                const margin = 10;
                const maxAvailableWidth = pageWidth - (margin * 2);
                const maxAvailableHeight = pageHeight - (margin * 2);

                let renderWidth = maxAvailableWidth;
                let renderHeight = (canvas.height * renderWidth) / canvas.width;

                // Fit 1 Halaman A4 untuk laporan keuangan resmi (Posisi Keuangan, Komprehensif, Arus Kas, Perubahan Aset Neto)
                // Jika tinggi melebihi area printable A4, skala proporsional agar PAS 100% dalam 1 lembar tanpa tumpah ke halaman 2
                const isSinglePageReport = (typeof elementId === 'string' && elementId !== 'calk') || (renderHeight <= maxAvailableHeight * 1.35);

                if (isSinglePageReport && renderHeight > maxAvailableHeight) {
                    renderHeight = maxAvailableHeight;
                    renderWidth = (canvas.width * renderHeight) / canvas.height;
                }

                if (renderHeight <= maxAvailableHeight) {
                    // Tepat 1 Halaman (Fit Single Page)
                    const xPos = margin + (maxAvailableWidth - renderWidth) / 2;
                    const yPos = margin + Math.max(0, (maxAvailableHeight - renderHeight) / 2);
                    pdf.addImage(imgData, 'PNG', xPos, yPos, renderWidth, renderHeight, undefined, 'FAST');
                } else {
                    // Dokumen multi-halaman jika memang laporan catatan (CALK) yang sangat panjang
                    let heightLeft = renderHeight;
                    let position = margin;

                    pdf.addImage(imgData, 'PNG', margin, position, maxAvailableWidth, renderHeight, undefined, 'FAST');
                    heightLeft -= maxAvailableHeight;

                    while (heightLeft > 0) {
                        position = heightLeft - renderHeight + margin;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', margin, position, maxAvailableWidth, renderHeight, undefined, 'FAST');
                        heightLeft -= maxAvailableHeight;
                    }
                }

                pdf.save(`${filename}.pdf`);
                noPrintElements.forEach(el => el.style.display = '');
                document.body.style.cursor = originalCursor;
                showExportToast('PDF Laporan berhasil diunduh!', 'success');
            } else {
                document.body.style.cursor = originalCursor;
                window.print();
            }
        } catch (err) {
            console.error("Gagal membuat PDF:", err);
            noPrintElements.forEach(el => el.style.display = '');
            document.body.style.cursor = originalCursor;
            showExportToast("Gagal memproses PDF: " + (err.message || 'Kesalahan sistem'), 'error');
        }
    },

    // Ekspor elemen DOM ke file Microsoft Word (.doc)
    toWord: (elementId, filename = "Laporan_Keuangan_MCC") => {
        const element = document.getElementById(elementId);
        if (!element) return;

        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${filename}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.4; }
                    table { border-collapse: collapse; width: 100%; margin-top: 15px; }
                    th, td { border: 1px solid #777; padding: 6px 8px; font-size: 10.5pt; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showExportToast('Dokumen Word berhasil diunduh!', 'success');
    },

    // Ekspor tabel DOM ke Microsoft Excel (.xlsx)
    toExcel: (tableId, filename = "Laporan_Keuangan_MCC") => {
        const element = document.getElementById(tableId);
        if (!element) return;

        if (window.XLSX) {
            const wb = window.XLSX.utils.table_to_book(element, { sheet: "Laporan MCC" });
            window.XLSX.writeFile(wb, `${filename}.xlsx`);
            showExportToast('File Excel berhasil diunduh!', 'success');
        } else {
            alert("Pustaka SheetJS belum dimuat.");
        }
    },

    // Ekspor daftar transaksi langsung ke file Excel terstruktur
    transactionsToExcel: (transactions, filename = "Jurnal_Transaksi_MCC") => {
        if (!window.XLSX) return;

        const rows = transactions.map((t, idx) => ({
            "No": idx + 1,
            "Tanggal": t.date,
            "No. Bukti / Voucher": t.voucherNo || "-",
            "Deskripsi / Keterangan": t.desc,
            "Jenis Aliran Kas": t.type,
            "Kategori Akun (ISAK 35)": t.category,
            "Pembatasan Dana": t.restriction,
            "Nominal (Rp)": t.amount
        }));

        const ws = window.XLSX.utils.json_to_sheet(rows);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Buku Jurnal Umum");
        window.XLSX.writeFile(wb, `${filename}.xlsx`);
        showExportToast('File Excel Jurnal berhasil diunduh!', 'success');
    },

    /**
     * Membangun dokumen HTML cetak profesional lengkap untuk Buku Jurnal (A4 Landscape)
     */
    buildJournalPrintHtml: (transactions = [], options = {}) => {
        const filename = options.filename || 'Buku_Jurnal_MCC';
        const org = options.org || (window.StorageService ? window.StorageService.getOrgProfile() : (window.DEFAULT_ORG_PROFILE || {}));
        const periodText = options.periodText || `Periode: s.d. ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const printTimestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

        let sumIn = 0;
        let sumOut = 0;
        transactions.forEach(t => {
            const amt = parseFloat(t.amount) || 0;
            if (t.type === 'Penerimaan') sumIn += amt;
            else if (t.type === 'Pengeluaran') sumOut += amt;
        });
        const netBalance = sumIn - sumOut;

        let rowsHtml = '';
        if (transactions.length === 0) {
            rowsHtml = `
                <tr>
                    <td colspan="7" style="padding: 24px; text-align: center; color: #94a3b8; font-style: italic;">
                        Tidak ada transaksi kas yang sesuai dengan filter pencarian.
                    </td>
                </tr>
            `;
        } else {
            transactions.forEach((tx, idx) => {
                const isEven = idx % 2 === 0;
                const rowBg = isEven ? '#ffffff' : '#f8fafc';
                const isRestricted = (tx.restriction || '').toLowerCase().includes('dengan');
                const badgeBg = isRestricted ? '#fef3c7' : '#ecfdf5';
                const badgeColor = isRestricted ? '#92400e' : '#047857';
                const badgeBorder = isRestricted ? '#fde68a' : '#a7f3d0';

                const isIn = tx.type === 'Penerimaan';
                const isOut = tx.type === 'Pengeluaran';

                rowsHtml += `
                    <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 6px 8px; text-align: center; color: #64748b; font-weight: 700; border-right: 1px solid #e2e8f0;">${idx + 1}</td>
                        <td style="padding: 6px 8px; border-right: 1px solid #e2e8f0;">
                            <div class="mcc-mono" style="font-weight: 700; color: #0f172a;">${formatDateHelper(tx.date)}</div>
                            ${tx.voucherNo ? `<div class="mcc-mono" style="font-size: 7.5px; color: #64748b; background: #e2e8f0; padding: 1px 4px; border-radius: 3px; display: inline-block; margin-top: 2px;">${tx.voucherNo}</div>` : ''}
                        </td>
                        <td style="padding: 6px 8px; font-weight: 700; color: #1e293b; border-right: 1px solid #e2e8f0; word-break: break-word;">
                            ${tx.desc || '-'}
                        </td>
                        <td style="padding: 6px 8px; color: #475569; font-weight: 600; border-right: 1px solid #e2e8f0;">
                            ${tx.category || '-'}
                        </td>
                        <td style="padding: 6px 8px; text-align: center; border-right: 1px solid #e2e8f0;">
                            <span style="display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 7.5px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; white-space: nowrap;">
                                ${tx.restriction || 'Tanpa Pembatasan'}
                            </span>
                        </td>
                        <td class="mcc-mono" style="padding: 6px 8px; text-align: right; border-right: 1px solid #e2e8f0; font-weight: 800; color: ${isIn ? '#15803d' : '#94a3b8'};">
                            ${isIn ? formatRupiahHelper(tx.amount) : '-'}
                        </td>
                        <td class="mcc-mono" style="padding: 6px 8px; text-align: right; font-weight: 800; color: ${isOut ? '#be123c' : '#94a3b8'};">
                            ${isOut ? formatRupiahHelper(tx.amount) : '-'}
                        </td>
                    </tr>
                `;
            });
        }

        return `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>${filename}</title>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 8mm 10mm;
                    }
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        color: #0f172a;
                        background: #ffffff;
                        margin: 0;
                        padding: 0;
                        font-size: 9pt;
                    }
                    .mcc-mono {
                        font-family: 'JetBrains Mono', monospace;
                        font-variant-numeric: tabular-nums;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                </style>
            </head>
            <body>
                <!-- Garis Aksen Gradien Atas -->
                <div style="height: 4px; background: linear-gradient(90deg, #00a884 0%, #0284c7 100%); border-radius: 2px; margin-bottom: 12px;"></div>

                <!-- Kop Surat Resmi Organisasi -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2px solid #0f172a; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="flex-shrink: 0;">
                            ${MCC_SVG_LOGO}
                        </div>
                        <div>
                            <h1 style="font-size: 15px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2;">
                                ${org.name || 'LSM MOLUCCAS COASTAL CARE (MCC)'}
                            </h1>
                            <p style="font-size: 9px; font-weight: 800; color: #00a884; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 0.8px;">
                                Pusat Konservasi Pesisir dan Laut Maluku • Sistem Informasi Keuangan ISAK 35
                            </p>
                            <p style="font-size: 8px; color: #64748b; margin: 2px 0 0 0;">
                                ${org.legal || 'SK Kemenkumham RI: AHU-0018921.AH.01.04.Tahun 2020 • NPWP: 94.882.112.4-941.000'}
                            </p>
                            <p style="font-size: 8px; color: #64748b; margin: 1px 0 0 0;">
                                ${org.address || 'Jl. Cendrawasih No. 21, Kota Ambon, Maluku - Indonesia'} • Telp: ${org.phone || '+62 812-4000-8899'}
                            </p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: inline-block; padding: 2px 7px; background: #0f172a; color: #ffffff; border-radius: 5px; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;">
                            STANDAR ISAK 35
                        </span>
                        <h2 style="font-size: 15px; font-weight: 900; color: #0f172a; margin: 3px 0 2px 0; text-transform: uppercase;">
                            BUKU JURNAL UMUM MUTASI KAS
                        </h2>
                        <p style="font-size: 9px; font-weight: 700; color: #0284c7; margin: 0;">
                            ${periodText}
                        </p>
                        <p style="font-size: 7.5px; color: #94a3b8; margin: 1px 0 0 0;">
                            Dicetak: ${printTimestamp} WIT
                        </p>
                    </div>
                </div>

                <!-- 4 Kartu Ringkasan KPI -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px;">
                    <div style="background: #f0fdf4; border: 1px solid #86efac; border-left: 4px solid #16a34a; border-radius: 6px; padding: 6px 10px;">
                        <div style="font-size: 7.5px; font-weight: 800; color: #15803d; text-transform: uppercase;">TOTAL PENERIMAAN (DEBIT)</div>
                        <div class="mcc-mono" style="font-size: 13px; font-weight: 900; color: #15803d; margin-top: 1px;">+${formatRupiahHelper(sumIn)}</div>
                    </div>
                    <div style="background: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 6px; padding: 6px 10px;">
                        <div style="font-size: 7.5px; font-weight: 800; color: #be123c; text-transform: uppercase;">TOTAL PENGELUARAN (KREDIT)</div>
                        <div class="mcc-mono" style="font-size: 13px; font-weight: 900; color: #e11d48; margin-top: 1px;">-${formatRupiahHelper(sumOut)}</div>
                    </div>
                    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 6px; padding: 6px 10px;">
                        <div style="font-size: 7.5px; font-weight: 800; color: #0369a1; text-transform: uppercase;">ARUS KAS BERSIH (NET)</div>
                        <div class="mcc-mono" style="font-size: 13px; font-weight: 900; color: #0284c7; margin-top: 1px;">${formatRupiahHelper(netBalance)}</div>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #64748b; border-radius: 6px; padding: 6px 10px;">
                        <div style="font-size: 7.5px; font-weight: 800; color: #475569; text-transform: uppercase;">TOTAL MUTASI TERCATAT</div>
                        <div class="mcc-mono" style="font-size: 13px; font-weight: 900; color: #334155; margin-top: 1px;">${transactions.length} Mutasi Kas</div>
                    </div>
                </div>

                <!-- Tabel Ledger Transaksi dengan Lebar Persentase Presisi (Anti-Cutoff) -->
                <table style="width: 100%; border-collapse: collapse; font-size: 9pt; border: 1px solid #cbd5e1; margin-bottom: 8px;">
                    <thead>
                        <tr style="background: #0f172a; color: #ffffff;">
                            <th style="padding: 7px 6px; text-align: center; width: 4%; font-weight: 800; border-right: 1px solid #334155;">NO</th>
                            <th style="padding: 7px 8px; text-align: left; width: 14%; font-weight: 800; border-right: 1px solid #334155;">TANGGAL & BUKTI</th>
                            <th style="padding: 7px 8px; text-align: left; width: 32%; font-weight: 800; border-right: 1px solid #334155;">KETERANGAN & URAIAN</th>
                            <th style="padding: 7px 8px; text-align: left; width: 18%; font-weight: 800; border-right: 1px solid #334155;">KATEGORI AKUN (ISAK 35)</th>
                            <th style="padding: 7px 8px; text-align: center; width: 12%; font-weight: 800; border-right: 1px solid #334155;">PEMBATASAN DANA</th>
                            <th style="padding: 7px 8px; text-align: right; width: 10%; font-weight: 800; border-right: 1px solid #334155;">DEBIT (MASUK)</th>
                            <th style="padding: 7px 8px; text-align: right; width: 10%; font-weight: 800;">KREDIT (KELUAR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <!-- Baris Rekapitulasi Total -->
                        <tr style="background: #f1f5f9; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; font-weight: 900;">
                            <td colspan="5" style="padding: 7px 10px; text-align: right; font-size: 9pt; color: #0f172a; text-transform: uppercase;">
                                TOTAL MUTASI KAS (PERIODE INI) :
                            </td>
                            <td class="mcc-mono" style="padding: 7px 8px; text-align: right; font-size: 10pt; color: #15803d; border-right: 1px solid #cbd5e1;">
                                ${formatRupiahHelper(sumIn)}
                            </td>
                            <td class="mcc-mono" style="padding: 7px 8px; text-align: right; font-size: 10pt; color: #be123c;">
                                ${formatRupiahHelper(sumOut)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Lembar Pengesahan Resmi -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                    <div style="text-align: center; width: 220px;">
                        <p style="font-size: 8px; color: #64748b; margin: 0 0 2px 0;">Dibuat Oleh:</p>
                        <p style="font-size: 9pt; font-weight: 800; color: #0f172a; margin: 0;">${org.financeTitle || 'Bendahara'}</p>
                        <div style="height: 44px; display: flex; align-items: center; justify-content: center;">
                            <div style="border: 1.5px dashed #00a884; border-radius: 8px; padding: 2px 8px; color: #00a884; font-size: 7pt; font-weight: 900; letter-spacing: 0.5px; transform: rotate(-3deg);">
                                VERIFIED • ISAK 35
                            </div>
                        </div>
                        <p style="font-size: 9pt; font-weight: 900; color: #0f172a; text-decoration: underline; margin: 0;">${org.financeName || 'Anna Valensia C de Fretes, S.E., M.M'}</p>
                        <p style="font-size: 7.5px; color: #64748b; margin: 1px 0 0 0;">Departemen Finansial</p>
                    </div>

                    <div style="text-align: center; width: 200px;">
                        <div style="display: inline-block; border: 2px solid #0f172a; border-radius: 8px; padding: 4px 10px; background: #f8fafc;">
                            <div style="font-size: 7.5pt; font-weight: 900; color: #0f172a; text-transform: uppercase;">DOKUMEN SAH & AKUNTABEL</div>
                            <div style="font-size: 6.5pt; color: #64748b; margin-top: 1px;">Sistem Informasi Keuangan Eksekutif</div>
                            <div style="font-size: 6pt; font-weight: 800; color: #00a884; margin-top: 1px;">ISAK 35 COMPLIANT</div>
                        </div>
                    </div>

                    <div style="text-align: center; width: 220px;">
                        <p style="font-size: 8px; color: #64748b; margin: 0 0 2px 0;">Ambon, ${todayFormatted}</p>
                        <p style="font-size: 9pt; font-weight: 800; color: #0f172a; margin: 0;">Mengetahui & Menyetujui,</p>
                        <p style="font-size: 8pt; font-weight: 700; color: #475569; margin: 0;">${org.leaderTitle || 'Direktur'}</p>
                        <div style="height: 44px; display: flex; align-items: center; justify-content: center;">
                            <div style="border: 1.5px dashed #0284c7; border-radius: 8px; padding: 2px 8px; color: #0284c7; font-size: 7pt; font-weight: 900; letter-spacing: 0.5px; transform: rotate(3deg);">
                                APPROVED & SIGNED
                            </div>
                        </div>
                        <p style="font-size: 9pt; font-weight: 900; color: #0f172a; text-decoration: underline; margin: 0;">${org.leaderName || 'Stefani Teria Salhuteru, S.Pi., M.Si'}</p>
                        <p style="font-size: 7.5px; color: #64748b; margin: 1px 0 0 0;">LSM Moluccas Coastal Care</p>
                    </div>
                </div>

                <!-- Footer Resmi Dokumen -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid #cbd5e1; font-size: 7.5px; color: #64748b; margin-top: 10px;">
                    <div>Dokumen Resmi Sistem Informasi Keuangan <strong>OlivaFinance</strong> • Moluccas Coastal Care (MCC) Berstandar ISAK 35</div>
                    <div style="font-style: italic;">Sah tanpa tanda tangan basah bila terverifikasi dalam database sistem keuangan</div>
                </div>
            </body>
            </html>
        `;
    },

    /**
     * Cetak Buku Jurnal secara Presisi Menggunakan Iframe Terisolasi (Anti-Cutoff & Siap Cetak A4 Landscape)
     */
    printJournal: (transactions = [], options = {}) => {
        const txList = transactions.length > 0 ? transactions : (window._currentJournalTransactions || []);
        const printHtml = ExportService.buildJournalPrintHtml(txList, options);

        let iframe = document.getElementById('mcc-print-frame');
        if (iframe) iframe.remove();

        iframe = document.createElement('iframe');
        iframe.id = 'mcc-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.zIndex = '-99999';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(printHtml);
        doc.close();

        // Beri waktu browser untuk memuat CSS dan font, lalu jalankan print
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 350);
    },

    /**
     * Cetak Elemen Laporan Keuangan Lainnya (A4 Portrait)
     */
    printElement: (elementId) => {
        const element = document.getElementById(elementId);
        if (!element) {
            window.print();
            return;
        }

        let iframe = document.getElementById('mcc-print-frame');
        if (iframe) iframe.remove();

        iframe = document.createElement('iframe');
        iframe.id = 'mcc-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.zIndex = '-99999';
        document.body.appendChild(iframe);

        const content = `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>Laporan Keuangan MCC</title>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm;
                    }
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        color: #0f172a;
                        background: #ffffff;
                        margin: 0;
                        padding: 0;
                        font-size: 9.5pt;
                    }
                    .font-mono-num {
                        font-family: 'JetBrains Mono', monospace;
                        font-variant-numeric: tabular-nums;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border-bottom: 1px solid #cbd5e1 !important;
                        padding: 6px 8px !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
            </html>
        `;

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 350);
    },

    exportToPdf: (id, name) => ExportService.toPDF(id, name),
    exportToWord: (id, name) => ExportService.toWord(id, name),
    exportToExcel: (id, name) => ExportService.toExcel(id, name),
    printReport: (id) => {
        if (id === 'journalTableContainer' || id === 'buku_jurnal') {
            return ExportService.printJournal();
        }
        ExportService.printElement(id);
    }
};

// Pastikan tersedia di scope window / browser global
if (typeof window !== 'undefined') {
    window.ExportService = ExportService;
}
