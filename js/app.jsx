/**
 * Olivafinance - Moluccas Coastal Care (MCC)
 * Sistem Informasi Keuangan & Pelaporan Akuntansi Entitas Nirlaba (ISAK 35)
 * Tema Desain: Modern Clean Executive Institutional (Inspirasi RSK Dharmais / Health Gov Console)
 */

// Reducer untuk State Transaksi dengan riwayat Undo & Redo
function transactionReducer(state, action) {
    const { past, present, future } = state;
    switch (action.type) {
        case 'SET_INITIAL':
            return { past: [], present: action.payload, future: [] };
        case 'ADD_TRANSACTION':
            return { 
                past: [...past, present], 
                present: [action.payload, ...present].sort((a,b) => new Date(b.date) - new Date(a.date)), 
                future: [] 
            };
        case 'EDIT_TRANSACTION':
            return { 
                past: [...past, present], 
                present: present.map(t => String(t.id) === String(action.payload.id) ? action.payload : t)
                                .sort((a,b) => new Date(b.date) - new Date(a.date)), 
                future: [] 
            };
        case 'DELETE_TRANSACTION':
            return { 
                past: [...past, present], 
                present: present.filter(t => String(t.id) !== String(action.payload)), 
                future: [] 
            };
        case 'UNDO':
            if (past.length === 0) return state;
            return { 
                past: past.slice(0, past.length - 1), 
                present: past[past.length - 1], 
                future: [present, ...future] 
            };
        case 'REDO':
            if (future.length === 0) return state;
            return { 
                past: [...past, present], 
                present: future[0], 
                future: future.slice(1) 
            };
        default: 
            return state;
    }
}

// Komponen Toast Notification Clean Modern
const Toast = ({ toast, onClose }) => {
    if (!toast) return null;
    const icons = {
        success: 'fa-circle-check text-emerald-600',
        error: 'fa-circle-exclamation text-rose-600',
        info: 'fa-circle-info text-sky-600',
        warning: 'fa-triangle-exclamation text-amber-600'
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3.5 bg-white text-slate-800 px-5 py-3.5 rounded-2xl shadow-xl border border-slate-200/80 max-w-md ring-1 ring-slate-900/5 animate-fade-in">
            <i className={`fas ${icons[toast.type || 'info']} text-xl`}></i>
            <div className="text-xs">
                {toast.title && <p className="font-extrabold tracking-wider uppercase text-slate-500 text-[10px]">{toast.title}</p>}
                <p className="text-slate-800 font-semibold mt-0.5">{toast.message}</p>
            </div>
            <button onClick={onClose} className="ml-3 text-slate-400 hover:text-slate-700 text-xs transition">
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

// Komponen Logo Resmi Moluccas Coastal Care (MCC) - Presisi Geometris Simetris Sempurna
const MCCLogo = ({ className = "w-9 h-9" }) => (
    <div className={`${className} relative rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-1.5 flex-shrink-0`}>
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sayap Daun Kiri (Hijau Zamrud MCC) - Simetris Sejajar */}
            <path d="M20 32 C19 22 9 18 8 8 C16 6 20 18 20 32 Z" fill="#00a884" />
            {/* Sayap Daun Kanan (Biru Samudera) - Refleksi Cermin Sejajar */}
            <path d="M20 32 C21 22 31 18 32 8 C24 6 20 18 20 32 Z" fill="#0284c7" />
            {/* Titik Embun Pusat Sejajar */}
            <circle cx="20" cy="8" r="2.8" fill="#00a884" />
        </svg>
    </div>
);

// Komponen Chart.js Clean Light
const ChartComponent = ({ type, data, options, id }) => {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        if (!chartRef.current || !window.Chart) return;

        window.Chart.defaults.color = '#64748b';
        window.Chart.defaults.borderColor = '#f1f5f9';
        window.Chart.defaults.font.family = '"Plus Jakarta Sans", sans-serif';

        const ctx = chartRef.current.getContext('2d');

        chartInstance.current = new window.Chart(ctx, {
            type,
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, options, type]);

    return <canvas ref={chartRef} id={id} />;
};

// ==========================================
// 1. DASHBOARD EKSEKUTIF (CLEAN MODERN INSTITUTIONAL CONSOLE)
// ==========================================
const Dashboard = ({ transactions, onNavigateToJournal, onOpenNewTx, requireAdmin }) => {
    let totalIncome = 0; 
    let totalExpense = 0;
    let netUnrestricted = 0; 
    let netRestricted = 0;
    let programExpense = 0;
    let adminExpense = 0;
    const [chartMode, setChartMode] = React.useState('AUTO'); // 'AUTO', 'DAILY', 'MONTHLY', 'BAR'

    let monthlyDataMap = {};
    let dailyDataMap = {};

    transactions.forEach(t => {
        const amount = parseFloat(t.amount) || 0;
        const dateStr = t.date || '';
        const month = dateStr.substring(0, 7);

        if (month) {
            if (!monthlyDataMap[month]) monthlyDataMap[month] = { income: 0, expense: 0 };
            if (t.type === "Penerimaan") monthlyDataMap[month].income += amount;
            else monthlyDataMap[month].expense += amount;
        }

        if (dateStr) {
            if (!dailyDataMap[dateStr]) dailyDataMap[dateStr] = { income: 0, expense: 0 };
            if (t.type === "Penerimaan") dailyDataMap[dateStr].income += amount;
            else dailyDataMap[dateStr].expense += amount;
        }

        if (t.type === "Penerimaan") {
            totalIncome += amount;
            if (t.restriction === "Tanpa Pembatasan") netUnrestricted += amount;
            else netRestricted += amount;
        } else {
            totalExpense += amount;
            if (t.restriction === "Tanpa Pembatasan") netUnrestricted -= amount;
            else netRestricted -= amount;

            if (t.category.includes("Program") || t.category.includes("Personil") || t.category.includes("Perjalanan")) {
                programExpense += amount;
            } else {
                adminExpense += amount;
            }
        }
    });

    const totalCash = totalIncome - totalExpense;
    const surplusDeficit = totalIncome - totalExpense;

    const monthKeys = Object.keys(monthlyDataMap).sort();
    const activeMonthsCount = Math.max(1, monthKeys.length);
    const avgMonthlyExpense = totalExpense / activeMonthsCount;
    const runwayMonths = avgMonthlyExpense > 0 ? (totalCash / avgMonthlyExpense).toFixed(1) : '∞';
    const programEfficiencyRatio = totalExpense > 0 ? Math.round((programExpense / totalExpense) * 100) : 85;

    // Tentukan mode grafik aktif
    const isSingleMonth = monthKeys.length <= 1;
    const activeMode = chartMode === 'AUTO' 
        ? (isSingleMonth ? 'DAILY' : 'MONTHLY') 
        : chartMode;

    let chartLabels = [];
    let chartIncome = [];
    let chartExpense = [];

    if (activeMode === 'DAILY') {
        const dateKeys = Object.keys(dailyDataMap).sort();
        chartLabels = dateKeys.map(d => {
            const parts = d.split('-');
            return `${parts[2]}/${parts[1]}`;
        });
        chartIncome = dateKeys.map(d => dailyDataMap[d].income);
        chartExpense = dateKeys.map(d => dailyDataMap[d].expense);
    } else {
        // Mode Bulanan kontinu
        let fullMonths = [...monthKeys];
        if (fullMonths.length < 5) {
            const latest = fullMonths[fullMonths.length - 1] || '2026-10';
            const [y, m] = latest.split('-').map(Number);
            const padded = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(y, m - 1 - i, 1);
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                padded.push(k);
            }
            fullMonths = padded;
        }

        chartLabels = fullMonths.map(m => {
            const parts = m.split('-');
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
            return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        });
        chartIncome = fullMonths.map(m => monthlyDataMap[m] ? monthlyDataMap[m].income : 0);
        chartExpense = fullMonths.map(m => monthlyDataMap[m] ? monthlyDataMap[m].expense : 0);
    }

    const isBarType = activeMode === 'BAR';
    const chartType = isBarType ? 'bar' : 'line';

    const trendData = {
        labels: chartLabels.length ? chartLabels : ['Bulan Ini'],
        datasets: [
            { 
                label: 'Penerimaan / Hibah', 
                data: chartIncome.length ? chartIncome : [0], 
                borderColor: '#00a884', 
                backgroundColor: isBarType ? '#00a884' : 'rgba(0, 168, 132, 0.12)', 
                fill: !isBarType, 
                tension: 0.35,
                borderWidth: isBarType ? 0 : 2.5,
                borderRadius: isBarType ? 6 : 0,
                pointRadius: isBarType ? 0 : 4,
                pointBackgroundColor: '#00a884',
                pointHoverRadius: 6
            },
            { 
                label: 'Pengeluaran / Realisasi', 
                data: chartExpense.length ? chartExpense : [0], 
                borderColor: '#f43f5e', 
                backgroundColor: isBarType ? '#f43f5e' : 'rgba(244, 63, 94, 0.08)', 
                fill: !isBarType, 
                tension: 0.35,
                borderWidth: isBarType ? 0 : 2.5,
                borderRadius: isBarType ? 6 : 0,
                pointRadius: isBarType ? 0 : 4,
                pointBackgroundColor: '#f43f5e',
                pointHoverRadius: 6
            }
        ]
    };

    // Donut chart alokasi dana
    const donutData = {
        labels: ['Tanpa Pembatasan', 'Dengan Pembatasan'],
        datasets: [{
            data: [Math.max(0, netUnrestricted), Math.max(0, netRestricted)],
            backgroundColor: ['#00a884', '#0284c7'],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 4
        }]
    };

    // Data Program Konservasi Unggulan
    const conservationPrograms = [
        { name: "Restorasi Terumbu Karang Teluk Ambon", budget: "Rp 150.000.000", deadline: "Des 2026", status: "Aktif", statusColor: "emerald" },
        { name: "Pembibitan Mangrove Pesisir Lease", budget: "Rp 85.000.000", deadline: "Nov 2026", status: "Berjalan", statusColor: "sky" },
        { name: "Pemberdayaan Nelayan Tradisional", budget: "Rp 40.000.000", deadline: "Nov 2026", status: "Monitoring", statusColor: "amber" }
    ];

    // Data Agenda Keuangan
    const upcomingAgendas = [
        { day: "05", month: "NOV", title: "Pelaporan Hibah Triwulan IV", target: "Donor Internasional", remaining: "5 hari lagi" },
        { day: "15", month: "NOV", title: "Rekonsiliasi Bank Bulanan", target: "Bank Mandiri & BSI", remaining: "15 hari lagi" },
        { day: "31", month: "DES", title: "Tutup Buku Akhir Tahun (ISAK 35)", target: "Yayasan MCC", remaining: "61 hari lagi" }
    ];

    return (
        <div className="space-y-4 pb-8">
            {/* Top Command Header Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm no-print">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
                    <p className="text-xs text-slate-500 font-medium">Ikhtisar keuangan & akuntabilitas standar ISAK 35 Yayasan Moluccas Coastal Care</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search Bar Input */}
                    <div className="relative">
                        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input 
                            type="text" 
                            placeholder="Cari transaksi..."
                            onClick={onNavigateToJournal}
                            readOnly
                            className="w-48 sm:w-56 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 placeholder:text-slate-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
                        />
                    </div>

                    {/* Sync Indicator */}
                    <div className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Tersinkron</span>
                    </div>

                    {/* Action Button: Catat Transaksi Baru (Otorisasi Admin) */}
                    <button 
                        onClick={() => requireAdmin ? requireAdmin(onOpenNewTx) : onOpenNewTx()}
                        className="px-4 py-2 bg-[#00a884] hover:bg-[#008f70] text-white font-bold rounded-xl text-xs shadow-sm flex items-center transition"
                    >
                        <i className="fas fa-plus mr-1.5 text-xs"></i> Catat Transaksi
                    </button>
                </div>
            </div>

            {/* Top 5 KPI Metric Cards (Sesuai Referensi Gambar) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* KPI 1: KAS & BANK */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-[#00a884] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <i className="fas fa-building-columns text-base"></i>
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">KAS & BANK LIKUID</span>
                            <span className="text-xs font-black text-slate-800 font-mono-num truncate block">{formatRupiah(totalCash)}</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Saldo Operasional</span>
                        <span className="text-emerald-600 font-bold">Aktif</span>
                    </div>
                </div>

                {/* KPI 2: PENERIMAAN HIBAH */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-[#0d9488] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <i className="fas fa-hand-holding-dollar text-base"></i>
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">TOTAL PENERIMAAN</span>
                            <span className="text-xs font-black text-emerald-600 font-mono-num truncate block">+{formatRupiah(totalIncome)}</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Hibah & Donasi</span>
                        <span className="font-bold text-slate-700">{transactions.filter(t => t.type === 'Penerimaan').length} Tx</span>
                    </div>
                </div>

                {/* KPI 3: BEBAN TERBAYAR */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-[#f59e0b] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <i className="fas fa-receipt text-base"></i>
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">BEBAN PROGRAM & OPS</span>
                            <span className="text-xs font-black text-rose-600 font-mono-num truncate block">-{formatRupiah(totalExpense)}</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Realisasi Dana</span>
                        <span className="font-bold text-slate-700">{transactions.filter(t => t.type === 'Pengeluaran').length} Tx</span>
                    </div>
                </div>

                {/* KPI 4: SURPLUS (DEFISIT) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-[#10b981] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <i className="fas fa-arrow-trend-up text-base"></i>
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">SURPLUS BERJALAN</span>
                            <span className={`text-xs font-black font-mono-num truncate block ${surplusDeficit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {surplusDeficit >= 0 ? '+' : ''}{formatRupiah(surplusDeficit)}
                            </span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Kenaikan Aset Neto</span>
                        <span className="font-bold text-emerald-600">ISAK 35</span>
                    </div>
                </div>

                {/* KPI 5: KETAHANAN KAS */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition col-span-2 md:col-span-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-[#0284c7] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <i className="fas fa-paper-plane text-base"></i>
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">KETAHANAN KAS</span>
                            <span className="text-xs font-black text-slate-800 font-mono-num truncate block">{runwayMonths} Bulan</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Efisiensi Program</span>
                        <span className="font-bold text-teal-600 font-mono-num">{programEfficiencyRatio}%</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: 2 Kolom Utama (Alokasi ISAK 35 vs Tren Arus Kas) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Kolom Kiri: Alokasi Sumber Daya ISAK 35 (5 Kolom) */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <i className="fas fa-pie-chart text-[#00a884] text-sm"></i>
                                <h2 className="text-sm font-extrabold text-slate-800">Alokasi Dana ISAK 35</h2>
                            </div>
                            <button 
                                onClick={onNavigateToJournal}
                                className="text-xs font-bold text-[#00a884] bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200/70 transition"
                            >
                                Lihat semua
                            </button>
                        </div>

                        {/* Donut Chart & Legend */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pb-4 border-b border-slate-100">
                            <div className="sm:col-span-5 h-36 relative flex items-center justify-center">
                                <ChartComponent 
                                    type="doughnut" 
                                    data={donutData} 
                                    options={{ 
                                        cutout: '72%', 
                                        plugins: { legend: { display: false } } 
                                    }} 
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total Kas</span>
                                    <span className="text-xs font-black text-slate-800 font-mono-num">{formatRupiah(totalCash).replace('Rp ', '')}</span>
                                </div>
                            </div>

                            <div className="sm:col-span-7 space-y-2.5">
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center font-bold text-slate-700">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#00a884] mr-2"></span>
                                            Tanpa Pembatasan
                                        </span>
                                        <span className="font-bold text-[#00a884] font-mono-num">{formatRupiah(netUnrestricted)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5 pl-4.5">Dana bebas operasional yayasan</p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center font-bold text-slate-700">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] mr-2"></span>
                                            Dengan Pembatasan
                                        </span>
                                        <span className="font-bold text-[#0284c7] font-mono-num">{formatRupiah(netRestricted)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5 pl-4.5">Dana terikat program donor</p>
                                </div>
                            </div>
                        </div>

                        {/* Mini Table: Program Konservasi */}
                        <div className="pt-3">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Program Konservasi Aktif</span>
                            <div className="space-y-1.5">
                                {conservationPrograms.map((prog, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition text-xs">
                                        <div className="flex items-center space-x-2 truncate pr-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></span>
                                            <span className="font-semibold text-slate-700 truncate">{prog.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <span className="font-mono-num text-slate-500 text-[11px]">{prog.budget}</span>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {prog.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Tren Arus Kas Bulanan (7 Kolom) */}
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div className="flex items-center space-x-2">
                                <i className="fas fa-chart-line text-[#00a884] text-sm"></i>
                                <h2 className="text-sm font-extrabold text-slate-800">Tren Arus Kas (Penerimaan vs Pengeluaran)</h2>
                            </div>
                            
                            {/* Toggle Mode Grafik */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600">
                                <button 
                                    onClick={() => setChartMode('DAILY')} 
                                    className={`px-2.5 py-1 rounded-lg transition ${activeMode === 'DAILY' ? 'bg-white text-slate-900 shadow-sm font-black' : 'hover:text-slate-900'}`}
                                >
                                    Harian
                                </button>
                                <button 
                                    onClick={() => setChartMode('MONTHLY')} 
                                    className={`px-2.5 py-1 rounded-lg transition ${activeMode === 'MONTHLY' ? 'bg-white text-slate-900 shadow-sm font-black' : 'hover:text-slate-900'}`}
                                >
                                    Bulanan
                                </button>
                                <button 
                                    onClick={() => setChartMode('BAR')} 
                                    className={`px-2.5 py-1 rounded-lg transition ${activeMode === 'BAR' ? 'bg-white text-slate-900 shadow-sm font-black' : 'hover:text-slate-900'}`}
                                >
                                    Batang
                                </button>
                            </div>
                        </div>

                        {/* Chart.js Canvas Container */}
                        <div className="h-60 w-full relative">
                            <ChartComponent 
                                type={chartType} 
                                data={trendData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: { mode: 'index', intersect: false },
                                    plugins: {
                                        legend: { 
                                            position: 'top', 
                                            align: 'end',
                                            labels: { boxWidth: 10, font: { size: 11, weight: '600' } } 
                                        },
                                        tooltip: {
                                            backgroundColor: '#1e293b',
                                            padding: 10,
                                            cornerRadius: 8,
                                            callbacks: {
                                                label: (ctx) => ` ${ctx.dataset.label}: ${formatRupiah(ctx.parsed.y)}`
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { grid: { display: false } },
                                        y: {
                                            grid: { color: '#f1f5f9' },
                                            ticks: {
                                                callback: (v) => v >= 1000000 ? `${(v/1000000).toFixed(0)} Jt` : v
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Summary Footer on Trend */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                        <div className="flex items-center space-x-4">
                            <span>Total Penerimaan: <strong className="text-emerald-600 font-mono-num">{formatRupiah(totalIncome)}</strong></span>
                            <span>Total Beban: <strong className="text-rose-600 font-mono-num">{formatRupiah(totalExpense)}</strong></span>
                        </div>
                        <span className="text-slate-400 font-medium">Standar ISAK 35 Entitas Nirlaba</span>
                    </div>
                </div>
            </div>

            {/* Bottom Section: 3 Cards Row (Sesuai Referensi Gambar Bawah) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card Bawah 1: Transaksi Kas Terbaru */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#00a884] flex items-center justify-center text-xs">
                                    <i className="fas fa-list-check"></i>
                                </div>
                                <h3 className="text-xs font-black text-slate-800">Transaksi Kas Terkini</h3>
                            </div>
                            <button onClick={onNavigateToJournal} className="text-[11px] font-bold text-[#00a884] hover:underline">
                                Buka Jurnal
                            </button>
                        </div>

                        <div className="space-y-2">
                            {transactions.slice(0, 3).map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition text-xs">
                                    <div className="overflow-hidden pr-2">
                                        <p className="font-semibold text-slate-800 truncate">{t.desc}</p>
                                        <p className="text-[10px] text-slate-400 font-mono-num">{t.date} • {t.category}</p>
                                    </div>
                                    <span className={`font-mono-num font-bold text-xs flex-shrink-0 ${t.type === 'Penerimaan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.type === 'Penerimaan' ? '+' : '-'}{formatRupiah(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Card Bawah 2: Penyaluran Dana Konservasi Prioritas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center text-xs">
                                    <i className="fas fa-seedling"></i>
                                </div>
                                <h3 className="text-xs font-black text-slate-800">Program Konservasi Prioritas</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Target 2026</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-slate-700">Rehabilitasi Terumbu Karang</span>
                                    <span className="font-bold text-[#00a884]">85%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#00a884] h-full rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-slate-700">Penanaman Mangrove Teluk Baguala</span>
                                    <span className="font-bold text-[#0284c7]">65%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#0284c7] h-full rounded-full" style={{ width: '65%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-slate-700">Pendidikan Bahari Siswa Ambon</span>
                                    <span className="font-bold text-[#f59e0b]">92%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#f59e0b] h-full rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Bawah 3: Agenda & Kepatuhan Keuangan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#f59e0b] flex items-center justify-center text-xs">
                                    <i className="fas fa-calendar-check"></i>
                                </div>
                                <h3 className="text-xs font-black text-slate-800">Agenda Kepatuhan & Audit</h3>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Terjadwal
                            </span>
                        </div>

                        <div className="space-y-2">
                            {upcomingAgendas.map((ag, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition text-xs">
                                    <div className="flex items-center space-x-2.5 truncate pr-2">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
                                            <span className="text-[9px] font-black text-[#00a884] leading-none">{ag.month}</span>
                                            <span className="text-[10px] font-black text-slate-800 leading-none">{ag.day}</span>
                                        </div>
                                        <div className="truncate">
                                            <p className="font-semibold text-slate-800 truncate">{ag.title}</p>
                                            <p className="text-[10px] text-slate-400">{ag.target}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 flex-shrink-0">
                                        {ag.remaining}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 2. BUKU JURNAL UMUM (TRANSACTION LEDGER)
// ==========================================
const Journal = ({ state, dispatch, onSyncRequest, showToast, isAdmin, requireAdmin }) => {
    const { past, present, future } = state;
    const defaultForm = {
        id: null,
        voucherNo: '',
        date: new Date().toISOString().split('T')[0],
        desc: '',
        type: 'Penerimaan',
        category: IN_CATEGORIES[0],
        restriction: 'Tanpa Pembatasan',
        amount: ''
    };

    const [formData, setFormData] = React.useState(defaultForm);
    const [isEditing, setIsEditing] = React.useState(false);
    const [showFormModal, setShowFormModal] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterType, setFilterType] = React.useState('ALL');
    const [filterRestriction, setFilterRestriction] = React.useState('ALL');
    const [filterMonth, setFilterMonth] = React.useState('ALL');

    const handleTypeChange = (type) => {
        setFormData(prev => ({ 
            ...prev, 
            type, 
            category: type === 'Penerimaan' ? IN_CATEGORIES[0] : EX_CATEGORIES[0] 
        }));
    };

    const generateVoucherNumber = (type, date) => {
        const prefix = type === 'Penerimaan' ? 'BKM' : 'BKK';
        const dateCode = (date || new Date().toISOString().split('T')[0]).replace(/-/g, '').substring(0, 6);
        const randomSeq = Math.floor(100 + Math.random() * 900);
        return `MCC-${prefix}-${dateCode}-${randomSeq}`;
    };

    const openCreateModal = () => {
        const now = new Date().toISOString().split('T')[0];
        setFormData({
            ...defaultForm,
            voucherNo: generateVoucherNumber('Penerimaan', now)
        });
        setIsEditing(false);
        setShowFormModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { 
            ...formData, 
            id: isEditing ? formData.id : `tx-${Date.now()}`, 
            amount: parseFloat(formData.amount) || 0,
            voucherNo: formData.voucherNo || generateVoucherNumber(formData.type, formData.date)
        };
        
        if (isEditing) {
            dispatch({ type: 'EDIT_TRANSACTION', payload });
            showToast({ title: 'Transaksi Diperbarui', message: `No Bukti ${payload.voucherNo} berhasil disimpan.`, type: 'success' });
            StorageService.syncTransactionToSupabase(payload, 'update');
        } else {
            dispatch({ type: 'ADD_TRANSACTION', payload });
            showToast({ title: 'Transaksi Ditambahkan', message: `Transaksi baru berhasil dibukukan ke jurnal.`, type: 'success' });
            StorageService.syncTransactionToSupabase(payload, 'insert');
        }
        setShowFormModal(false);
        setFormData(defaultForm);
    };

    const handleEdit = (tx) => {
        setFormData({ ...tx });
        setIsEditing(true);
        setShowFormModal(true);
    };

    const handleDelete = (id, voucherNo) => {
        if (confirm(`Yakin ingin menghapus transaksi ${voucherNo || id}? Tindakan ini dapat dibatalkan melalui fitur Undo.`)) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
            showToast({ title: 'Transaksi Dihapus', message: `Data telah dihapus dari jurnal umum.`, type: 'warning' });
            StorageService.syncTransactionToSupabase({ id }, 'delete');
        }
    };

    // Filter transaksi
    const filteredTransactions = present.filter(t => {
        const matchSearch = (t.desc || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (t.voucherNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'ALL' || t.type === filterType;
        const matchRest = filterRestriction === 'ALL' || t.restriction === filterRestriction;
        const matchMonth = filterMonth === 'ALL' || (t.date && t.date.startsWith(filterMonth));
        return matchSearch && matchType && matchRest && matchMonth;
    });

    const sumIn = filteredTransactions.filter(t => t.type === 'Penerimaan').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const sumOut = filteredTransactions.filter(t => t.type === 'Pengeluaran').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const netFiltered = sumIn - sumOut;

    const availableMonths = Array.from(new Set(present.map(t => (t.date || '').substring(0, 7)).filter(Boolean))).sort().reverse();

    return (
        <div className="space-y-4 pb-12">
            {/* Header Jurnal Eksekutif */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm no-print">
                <div>
                    <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            GENERAL LEDGER
                        </span>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Buku Jurnal Umum</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Pencatatan mutasi kas harian dengan klasifikasi akun standar ISAK 35
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <button 
                        onClick={() => window.print()}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center"
                    >
                        <i className="fas fa-print mr-1.5 text-slate-500"></i> Print
                    </button>
                    <button 
                        onClick={() => ExportService.toPDF('journalTableContainer', 'Buku_Jurnal_MCC')}
                        className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center"
                    >
                        <i className="fas fa-file-pdf mr-1.5 text-rose-600"></i> PDF
                    </button>
                    <button 
                        onClick={() => ExportService.transactionsToExcel(filteredTransactions, 'Buku_Jurnal_MCC')}
                        className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition flex items-center"
                    >
                        <i className="fas fa-file-excel mr-1.5 text-emerald-600"></i> Excel
                    </button>
                    <button 
                        onClick={() => {
                            const doUndo = () => {
                                dispatch({ type: 'UNDO' });
                                showToast({ title: 'Undo Berhasil', message: 'Langkah terakhir telah dibatalkan.', type: 'info' });
                            };
                            requireAdmin ? requireAdmin(doUndo) : doUndo();
                        }} 
                        disabled={past.length === 0} 
                        className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 disabled:opacity-30 transition flex items-center" 
                        title="Batalkan aksi terakhir"
                    >
                        <i className="fas fa-undo mr-1 text-slate-400"></i>
                    </button>
                    <button 
                        onClick={() => {
                            const doRedo = () => {
                                dispatch({ type: 'REDO' });
                                showToast({ title: 'Redo Berhasil', message: 'Aksi sebelumnya telah diulang.', type: 'info' });
                            };
                            requireAdmin ? requireAdmin(doRedo) : doRedo();
                        }} 
                        disabled={future.length === 0} 
                        className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 disabled:opacity-30 transition flex items-center" 
                        title="Ulangi aksi"
                    >
                        <i className="fas fa-redo mr-1 text-slate-400"></i>
                    </button>
                    <button 
                        onClick={() => requireAdmin ? requireAdmin(openCreateModal) : openCreateModal()}
                        className="px-4 py-2 bg-[#00a884] hover:bg-[#008f70] text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center"
                    >
                        <i className="fas fa-plus mr-1.5"></i> Catat Transaksi
                    </button>
                </div>
            </div>

            {/* 3 Kartu Ringkasan Real-Time (Filtered Stats) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-emerald-500 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Penerimaan Terfilter</span>
                        <p className="text-lg font-black text-emerald-600 font-mono-num mt-0.5">+{formatRupiah(sumIn)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <i className="fas fa-arrow-down text-lg"></i>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-rose-500 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pengeluaran Terfilter</span>
                        <p className="text-lg font-black text-rose-600 font-mono-num mt-0.5">-{formatRupiah(sumOut)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <i className="fas fa-arrow-up text-lg"></i>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-[#00a884] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Bersih Terfilter</span>
                        <p className={`text-lg font-black font-mono-num mt-0.5 ${netFiltered >= 0 ? 'text-[#00a884]' : 'text-amber-600'}`}>
                            {formatRupiah(netFiltered)}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#00a884]">
                        <i className="fas fa-wallet text-lg"></i>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between no-print">
                <div className="w-full md:w-80 relative">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari voucher, keterangan, akun..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Filter Jenis */}
                    <select 
                        value={filterType} 
                        onChange={e => setFilterType(e.target.value)} 
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                        <option value="ALL">Semua Jenis Kas</option>
                        <option value="Penerimaan">Penerimaan (Kas Masuk)</option>
                        <option value="Pengeluaran">Pengeluaran (Beban)</option>
                    </select>

                    {/* Filter Pembatasan ISAK 35 */}
                    <select 
                        value={filterRestriction} 
                        onChange={e => setFilterRestriction(e.target.value)} 
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                        <option value="ALL">Semua Pembatasan Dana</option>
                        <option value="Tanpa Pembatasan">Tanpa Pembatasan</option>
                        <option value="Dengan Pembatasan">Dengan Pembatasan</option>
                    </select>

                    {/* Filter Bulan */}
                    <select 
                        value={filterMonth} 
                        onChange={e => setFilterMonth(e.target.value)} 
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                        <option value="ALL">Semua Periode Bulan</option>
                        {availableMonths.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabel Jurnal Transaksi */}
            <div id="journalTableContainer" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">TANGGAL</th>
                                <th className="py-3 px-4">KETERANGAN</th>
                                <th className="py-3 px-4">KATEGORI AKUN</th>
                                <th className="py-3 px-4">PEMBATASAN</th>
                                <th className="py-3 px-4 text-right">DEBIT (MASUK)</th>
                                <th className="py-3 px-4 text-right">KREDIT (KELUAR)</th>
                                {isAdmin && <th className="py-3 px-4 text-center no-print">AKSI</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                                        <i className="fas fa-folder-open text-3xl mb-2 text-slate-300 block"></i>
                                        Tidak ada transaksi kas yang sesuai dengan filter pencarian.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className="font-mono-num font-bold text-slate-700 block text-xs">{formatDateId(tx.date)}</span>
                                            {tx.voucherNo && <span className="text-[10px] text-slate-400 font-mono-num">{tx.voucherNo}</span>}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <p className="font-bold text-slate-900">{tx.desc}</p>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="text-slate-600 text-xs font-medium">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className="text-slate-600 text-xs font-medium">
                                                {tx.restriction}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono-num whitespace-nowrap">
                                            {tx.type === 'Penerimaan' ? (
                                                <span className="font-bold text-emerald-600">{formatRupiah(tx.amount)}</span>
                                            ) : (
                                                <span className="text-slate-400 font-bold">-</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono-num whitespace-nowrap">
                                            {tx.type === 'Pengeluaran' ? (
                                                <span className="font-bold text-rose-600">{formatRupiah(tx.amount)}</span>
                                            ) : (
                                                <span className="text-slate-400 font-bold">-</span>
                                            )}
                                        </td>
                                        {isAdmin && (
                                            <td className="py-3 px-4 text-center no-print">
                                                <div className="flex items-center justify-center space-x-1.5">
                                                    <button 
                                                        onClick={() => handleEdit(tx)} 
                                                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#00a884] hover:text-white text-slate-600 flex items-center justify-center transition"
                                                        title="Edit Transaksi"
                                                    >
                                                        <i className="fas fa-pencil text-[10px]"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(tx.id, tx.voucherNo)} 
                                                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 flex items-center justify-center transition"
                                                        title="Hapus Transaksi"
                                                    >
                                                        <i className="fas fa-trash text-[10px]"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span>Menampilkan <strong>{filteredTransactions.length}</strong> dari <strong>{present.length}</strong> total mutasi kas</span>
                    <span className="font-mono-num text-[11px]">Sistem Keuangan ISAK 35</span>
                </div>
            </div>

            {/* Modal Formulir Transaksi Kas */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in no-print">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center">
                                    <i className={`fas ${isEditing ? 'fa-edit' : 'fa-receipt'} text-base`}></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800">
                                        {isEditing ? 'Edit Mutasi Kas' : 'Catat Kas Baru (ISAK 35)'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400">Pencatatan dana masuk & beban program yayasan</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowFormModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center transition"
                            >
                                <i className="fas fa-times text-xs"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            {/* Toggle Jenis Kas */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('Penerimaan')}
                                    className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center ${formData.type === 'Penerimaan' ? 'bg-[#00a884] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    <i className="fas fa-arrow-down mr-1.5"></i> Penerimaan (Kas Masuk)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('Pengeluaran')}
                                    className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center ${formData.type === 'Pengeluaran' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    <i className="fas fa-arrow-up mr-1.5"></i> Pengeluaran (Beban Program)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Bukti Kas</label>
                                    <input 
                                        type="text" 
                                        value={formData.voucherNo} 
                                        onChange={e => setFormData({ ...formData, voucherNo: e.target.value })} 
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20" 
                                        placeholder="MCC-BKM-..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Transaksi *</label>
                                    <input 
                                        type="date" 
                                        value={formData.date} 
                                        onChange={e => setFormData({ ...formData, date: e.target.value })} 
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Kategori Akun ISAK 35 *</label>
                                <select 
                                    value={formData.category} 
                                    onChange={e => setFormData({ ...formData, category: e.target.value })} 
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                >
                                    {(formData.type === 'Penerimaan' ? IN_CATEGORIES : EX_CATEGORIES).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Deskripsi / Keterangan Pembayaran *</label>
                                <input 
                                    type="text" 
                                    value={formData.desc} 
                                    onChange={e => setFormData({ ...formData, desc: e.target.value })} 
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20" 
                                    placeholder="Contoh: Honor enumerator pemetaan mangrove Teluk Ambon" 
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Pembatasan Sumber Dana *</label>
                                    <select 
                                        value={formData.restriction} 
                                        onChange={e => setFormData({ ...formData, restriction: e.target.value })} 
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                    >
                                        <option value="Tanpa Pembatasan">Tanpa Pembatasan</option>
                                        <option value="Dengan Pembatasan">Dengan Pembatasan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nominal (Rupiah) *</label>
                                    <input 
                                        type="number" 
                                        value={formData.amount} 
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20" 
                                        placeholder="0" 
                                        min="1" 
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Tombol Simpan */}
                            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowFormModal(false)} 
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2 bg-[#00a884] hover:bg-[#008f70] text-white rounded-xl text-xs font-bold shadow-sm transition"
                                >
                                    <i className="fas fa-check mr-1.5"></i> Catat ke Jurnal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// 3. LAPORAN KEUANGAN RESMI (STANDAR ISAK 35)
// ==========================================
const OfficialSignatures = () => {
    const org = StorageService.getOrgProfile();
    return (
        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center text-center text-xs text-slate-800 px-8">
            <div className="w-56">
                <p className="text-slate-500 mb-1">Mengetahui,</p>
                <p className="font-bold text-slate-800">{org.leaderTitle || 'Direktur Eksekutif'}</p>
                <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Cap]</span>
                </div>
                <p className="font-bold underline text-slate-800">{org.leaderName || 'M. Azis Pattimura, M.Si'}</p>
                <p className="text-[10px] text-slate-400">Yayasan Moluccas Coastal Care</p>
            </div>

            <div className="w-56">
                <p className="text-slate-500 mb-1">Ambon, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold text-slate-800">{org.financeTitle || 'Bendahara / Manajer Keuangan'}</p>
                <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-slate-300 italic">[Tanda Tangan]</span>
                </div>
                <p className="font-bold underline text-slate-800">{org.financeName || 'Sarah Latuconsina, S.E.'}</p>
                <p className="text-[10px] text-slate-400">Departemen Finansial & Akuntansi</p>
            </div>
        </div>
    );
};

const Reports = ({ transactions }) => {
    const [activeReport, setActiveReport] = React.useState('posisi_keuangan');
    const org = StorageService.getOrgProfile();

    let assets = { cash: 0, fixed: 0 };
    let netAssets = { unrestricted: 0, restricted: 0 };
    let revenue = { unrestricted: 0, restricted: 0 };
    let expenses = {};
    let cashFlows = { operatingIn: 0, operatingOut: 0 };

    EX_CATEGORIES.forEach(cat => { expenses[cat] = 0; });

    transactions.forEach(t => {
        const amount = parseFloat(t.amount) || 0;
        if (t.type === 'Penerimaan') {
            assets.cash += amount;
            cashFlows.operatingIn += amount;
            if (t.restriction === 'Tanpa Pembatasan') {
                netAssets.unrestricted += amount;
                revenue.unrestricted += amount;
            } else {
                netAssets.restricted += amount;
                revenue.restricted += amount;
            }
        } else {
            assets.cash -= amount;
            cashFlows.operatingOut += amount;
            if (expenses[t.category] !== undefined) {
                expenses[t.category] += amount;
            } else {
                expenses[t.category] = amount;
            }
            if (t.restriction === 'Tanpa Pembatasan') {
                netAssets.unrestricted -= amount;
            } else {
                netAssets.restricted -= amount;
            }
        }
    });

    const totalExpense = Object.values(expenses).reduce((a, b) => a + b, 0);
    const totalRevenue = revenue.unrestricted + revenue.restricted;
    const surplusPeriod = totalRevenue - totalExpense;

    const reportTabs = [
        { id: 'posisi_keuangan', title: 'Posisi Keuangan', icon: 'fa-scale-balanced' },
        { id: 'komprehensif', title: 'Komprehensif', icon: 'fa-chart-pie' },
        { id: 'perubahan_aset_neto', title: 'Perubahan Aset Neto', icon: 'fa-arrows-rotate' },
        { id: 'arus_kas', title: 'Arus Kas', icon: 'fa-money-bill-transfer' },
        { id: 'calk', title: 'CALK', icon: 'fa-book-open' }
    ];

    return (
        <div className="space-y-4 pb-12">
            {/* Toolbar Laporan */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm no-print">
                <div className="flex flex-wrap items-center gap-1.5">
                    {reportTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveReport(tab.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center ${activeReport === tab.id ? 'bg-[#00a884] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <i className={`fas ${tab.icon} mr-1.5`}></i> {tab.title}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-1.5">
                    <button 
                        onClick={() => ExportService.printReport(activeReport)} 
                        className="px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-bold transition flex items-center shadow-sm"
                    >
                        <i className="fas fa-print mr-1.5"></i> Print
                    </button>
                    <button 
                        onClick={() => ExportService.exportToPdf(activeReport, `Laporan_${activeReport}_MCC`)} 
                        className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold shadow-sm transition flex items-center"
                    >
                        <i className="fas fa-file-pdf mr-1.5"></i> PDF
                    </button>
                    <button 
                        onClick={() => ExportService.exportToWord(activeReport, `Laporan_${activeReport}_MCC`)} 
                        className="px-3 py-1.5 bg-sky-600 text-white hover:bg-sky-700 rounded-xl text-xs font-bold shadow-sm transition flex items-center"
                    >
                        <i className="fas fa-file-word mr-1.5"></i> Word
                    </button>
                    <button 
                        onClick={() => ExportService.exportToExcel(activeReport, `Laporan_${activeReport}_MCC`)} 
                        className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-sm transition flex items-center"
                    >
                        <i className="fas fa-file-excel mr-1.5"></i> Excel
                    </button>
                </div>
            </div>

            {/* Kertas Lembar Laporan Keuangan (Printable A4 Sheet) */}
            <div id={activeReport} className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-sm text-slate-900 max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none">
                {/* Kop Surat Entitas Nirlaba Resmi */}
                <div className="text-center pb-6 border-b-2 border-slate-800 mb-6">
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">{org.name || 'YAYASAN MOLUCCAS COASTAL CARE (MCC)'}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{org.legal || 'SK Kemenkumham RI: AHU-0014298.AH.01.04.Tahun 2020 • NPWP: 94.882.112.4-941.000'}</p>
                    <p className="text-xs text-slate-500">{org.address || 'Kawasan Konservasi Teluk Ambon, Maluku, Indonesia'}</p>
                    <div className="mt-4 pt-3 border-t border-slate-200">
                        <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                            {reportTabs.find(t => t.id === activeReport)?.title.toUpperCase()}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Periode s.d. {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (Dalam Rupiah)</p>
                    </div>
                </div>

                {/* Konten Laporan Sesuai Tab Aktif */}
                {activeReport === 'posisi_keuangan' && (
                    <div className="space-y-6 text-xs">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-300 font-bold text-slate-700">
                                    <th className="py-2 text-left">ASET</th>
                                    <th className="py-2 text-right">JUMLAH (RP)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr><td className="py-2 font-bold text-slate-800">Aset Lancar:</td><td></td></tr>
                                <tr><td className="pl-6 py-1">Kas dan Setara Kas</td><td className="text-right font-mono-num">{formatRupiah(assets.cash)}</td></tr>
                                <tr><td className="pl-6 py-1">Piutang Hibah / Donor</td><td className="text-right font-mono-num">Rp 0</td></tr>
                                <tr className="font-bold bg-slate-50"><td className="py-2">Jumlah Aset Lancar</td><td className="text-right font-mono-num">{formatRupiah(assets.cash)}</td></tr>
                                
                                <tr><td className="py-2 font-bold text-slate-800 pt-4">Aset Tidak Lancar:</td><td></td></tr>
                                <tr><td className="pl-6 py-1">Aset Tetap Peralatan Riset & Konservasi</td><td className="text-right font-mono-num">Rp 25.000.000</td></tr>
                                <tr><td className="pl-6 py-1">Akumulasi Penyusutan</td><td className="text-right font-mono-num text-rose-600">(Rp 5.000.000)</td></tr>
                                <tr className="font-bold bg-slate-50"><td className="py-2">Jumlah Aset Tidak Lancar</td><td className="text-right font-mono-num">Rp 20.000.000</td></tr>

                                <tr className="font-black text-sm border-t-2 border-b-2 border-slate-800 bg-emerald-50/50">
                                    <td className="py-2.5">JUMLAH ASET</td>
                                    <td className="text-right font-mono-num text-emerald-800">{formatRupiah(assets.cash + 20000000)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <table className="w-full mt-6">
                            <thead>
                                <tr className="border-b border-slate-300 font-bold text-slate-700">
                                    <th className="py-2 text-left">LIABILITAS DAN ASET NETO</th>
                                    <th className="py-2 text-right">JUMLAH (RP)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr><td className="py-2 font-bold text-slate-800">Liabilitas Jangka Pendek:</td><td className="text-right font-mono-num">Rp 0</td></tr>
                                <tr className="font-bold bg-slate-50"><td className="py-2">Jumlah Liabilitas</td><td className="text-right font-mono-num">Rp 0</td></tr>

                                <tr><td className="py-2 font-bold text-slate-800 pt-4">Aset Neto (ISAK 35):</td><td></td></tr>
                                <tr><td className="pl-6 py-1">Tanpa Pembatasan dari Pemberi Sumber Daya</td><td className="text-right font-mono-num">{formatRupiah(netAssets.unrestricted + 20000000)}</td></tr>
                                <tr><td className="pl-6 py-1">Dengan Pembatasan dari Pemberi Sumber Daya (Terikat Program)</td><td className="text-right font-mono-num">{formatRupiah(netAssets.restricted)}</td></tr>
                                <tr className="font-bold bg-slate-50"><td className="py-2">Jumlah Aset Neto</td><td className="text-right font-mono-num">{formatRupiah(netAssets.unrestricted + netAssets.restricted + 20000000)}</td></tr>

                                <tr className="font-black text-sm border-t-2 border-b-2 border-slate-800 bg-emerald-50/50">
                                    <td className="py-2.5">JUMLAH LIABILITAS DAN ASET NETO</td>
                                    <td className="text-right font-mono-num text-emerald-800">{formatRupiah(netAssets.unrestricted + netAssets.restricted + 20000000)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {(activeReport === 'komprehensif' || activeReport === 'aktivitas') && (
                    <div className="space-y-6 text-xs">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-800 font-bold text-slate-800">
                                    <th className="py-2 text-left">URAIAN KEGIATAN & PENGHASILAN KOMPREHENSIF</th>
                                    <th className="py-2 text-right">TANPA PEMBATASAN</th>
                                    <th className="py-2 text-right">DENGAN PEMBATASAN</th>
                                    <th className="py-2 text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr><td colSpan="4" className="font-bold text-sm pt-3 pb-1 text-slate-800">PENDAPATAN DAN PENGHASILAN</td></tr>
                                <tr>
                                    <td className="pl-6 py-1">Pendapatan Hibah & Donasi Donor</td>
                                    <td className="text-right font-mono-num">{formatRupiah(revenue.unrestricted)}</td>
                                    <td className="text-right font-mono-num">{formatRupiah(revenue.restricted)}</td>
                                    <td className="text-right font-mono-num font-bold">{formatRupiah(totalRevenue)}</td>
                                </tr>
                                <tr className="font-bold bg-slate-50">
                                    <td className="py-2">Jumlah Pendapatan</td>
                                    <td className="text-right font-mono-num">{formatRupiah(revenue.unrestricted)}</td>
                                    <td className="text-right font-mono-num">{formatRupiah(revenue.restricted)}</td>
                                    <td className="text-right font-mono-num">{formatRupiah(totalRevenue)}</td>
                                </tr>

                                <tr><td colSpan="4" className="font-bold text-sm pt-4 pb-1 text-slate-800">BEBAN OPERASIONAL & PROGRAM</td></tr>
                                {EX_CATEGORIES.map(cat => (
                                    <tr key={cat}>
                                        <td className="pl-6 py-1">{cat}</td>
                                        <td className="text-right font-mono-num">-</td>
                                        <td className="text-right font-mono-num">-</td>
                                        <td className="text-right font-mono-num">{formatRupiah(expenses[cat])}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold bg-slate-50">
                                    <td className="py-2">Jumlah Beban</td>
                                    <td className="text-right font-mono-num">-</td>
                                    <td className="text-right font-mono-num">-</td>
                                    <td className="text-right font-mono-num font-bold text-rose-600">({formatRupiah(totalExpense)})</td>
                                </tr>

                                <tr className="font-black text-sm border-t-2 border-b-2 border-slate-800 bg-emerald-50/50">
                                    <td className="py-2.5">KENAIKAN (PENURUNAN) ASET NETO BERJALAN</td>
                                    <td colSpan="2"></td>
                                    <td className="text-right font-mono-num text-emerald-800">{formatRupiah(surplusPeriod)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeReport === 'perubahan_aset_neto' && (
                    <div className="space-y-6 text-xs">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-800 font-bold text-slate-800">
                                    <th className="py-2 text-left">REKONSILIASI PERUBAHAN ASET NETO</th>
                                    <th className="py-2 text-right">TANPA PEMBATASAN</th>
                                    <th className="py-2 text-right">DENGAN PEMBATASAN</th>
                                    <th className="py-2 text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-2 font-bold text-slate-800">Saldo Awal Aset Neto (01 Jan 2026)</td>
                                    <td className="text-right font-mono-num">Rp 0</td>
                                    <td className="text-right font-mono-num">Rp 0</td>
                                    <td className="text-right font-mono-num font-bold">Rp 0</td>
                                </tr>
                                <tr><td colSpan="4" className="font-bold text-sm pt-3 pb-1 text-slate-800">Perubahan Aset Neto Berjalan:</td></tr>
                                <tr>
                                    <td className="pl-6 py-1">Penerimaan Penghasilan Periode Berjalan</td>
                                    <td className="text-right font-mono-num text-emerald-700">+{formatRupiah(revenue.unrestricted)}</td>
                                    <td className="text-right font-mono-num text-emerald-700">+{formatRupiah(revenue.restricted)}</td>
                                    <td className="text-right font-mono-num font-bold text-emerald-700">+{formatRupiah(totalRevenue)}</td>
                                </tr>
                                <tr>
                                    <td className="pl-6 py-1">Beban Operasional & Program</td>
                                    <td className="text-right font-mono-num text-rose-700">({formatRupiah(netAssets.unrestricted < 0 ? Math.abs(netAssets.unrestricted - revenue.unrestricted) : totalExpense)})</td>
                                    <td className="text-right font-mono-num text-rose-700">-</td>
                                    <td className="text-right font-mono-num font-bold text-rose-700">({formatRupiah(totalExpense)})</td>
                                </tr>
                                <tr>
                                    <td className="pl-6 py-1 font-semibold">Surplus / (Defisit) Bersih Periode Berjalan</td>
                                    <td className="text-right font-mono-num font-bold">{formatRupiah(revenue.unrestricted - 47000000)}</td>
                                    <td className="text-right font-mono-num font-bold text-emerald-700">+{formatRupiah(netAssets.restricted)}</td>
                                    <td className="text-right font-mono-num font-bold text-emerald-800">{formatRupiah(surplusPeriod)}</td>
                                </tr>
                                <tr className="font-bold bg-slate-50">
                                    <td className="py-2">Reklasifikasi Pemenuhan Pembatasan Program</td>
                                    <td className="text-right font-mono-num">Rp 0</td>
                                    <td className="text-right font-mono-num">Rp 0</td>
                                    <td className="text-right font-mono-num">Rp 0</td>
                                </tr>
                                <tr className="font-black text-sm border-t-2 border-b-2 border-slate-800 bg-emerald-50/50">
                                    <td className="py-2.5">SALDO AKHIR ASET NETO (31 OKT 2026)</td>
                                    <td className="text-right font-mono-num">{formatRupiah(netAssets.unrestricted + 20000000)}</td>
                                    <td className="text-right font-mono-num">{formatRupiah(netAssets.restricted)}</td>
                                    <td className="text-right font-mono-num text-emerald-800">{formatRupiah(netAssets.unrestricted + netAssets.restricted + 20000000)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeReport === 'arus_kas' && (
                    <div className="space-y-6 text-xs">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-800 font-bold text-slate-800">
                                    <th className="py-2 text-left">ARUS KAS DARI AKTIVITAS OPERASI</th>
                                    <th className="py-2 text-right">JUMLAH (RP)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr><td className="pl-6 py-1">Penerimaan dari Hibah Donor dan Donasi Publik</td><td className="text-right font-mono-num text-emerald-700">{formatRupiah(cashFlows.operatingIn)}</td></tr>
                                <tr><td className="pl-6 py-1">Pembayaran untuk Beban Program dan Administrasi Operasional</td><td className="text-right font-mono-num text-rose-700">({formatRupiah(cashFlows.operatingOut)})</td></tr>
                                <tr className="font-bold bg-slate-50"><td className="py-2">Arus Kas Bersih dari Aktivitas Operasi</td><td className="text-right font-mono-num">{formatRupiah(cashFlows.operatingIn - cashFlows.operatingOut)}</td></tr>

                                <tr className="font-black text-sm border-t-2 border-b-2 border-slate-800 bg-emerald-50/50">
                                    <td className="py-2.5">KENAIKAN (PENURUNAN) BERSIH KAS DAN SETARA KAS</td>
                                    <td className="text-right font-mono-num text-emerald-800">{formatRupiah(assets.cash)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeReport === 'calk' && (
                    <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                        <h4 className="font-black text-sm text-slate-900 border-b border-slate-200 pb-1">1. UMUM DAN PROFIL ENTITAS</h4>
                        <p>Yayasan Moluccas Coastal Care (MCC) adalah organisasi nirlaba yang berkedudukan di Ambon, Maluku, yang bergerak di bidang konservasi ekosistem laut, pesisir, rehabilitasi mangrove, perlindungan terumbu karang, dan pemberdayaan masyarakat pesisir kepulauan.</p>
                        
                        <h4 className="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 mt-4">2. KEBIJAKAN AKUNTANSI SIGNIFIKAN (ISAK 35)</h4>
                        <p>Laporan keuangan disusun berdasarkan Interpretasi Standar Akuntansi Keuangan 35 (ISAK 35) yang diterbitkan oleh Ikatan Akuntan Indonesia (IAI) mengenai Penyajian Laporan Keuangan Entitas Nirlaba.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Dasar Pengukuran:</strong> Laporan keuangan disusun dengan konsep nilai historis (*historical cost*).</li>
                            <li><strong>Klasifikasi Sumber Daya:</strong> Dana diklasifikasikan menjadi <em>Aset Neto Tanpa Pembatasan</em> (dana bebas operasional) dan <em>Aset Neto Dengan Pembatasan</em> (dana terikat donor untuk program konservasi terumbu karang/mangrove).</li>
                            <li><strong>Pengakuan Pendapatan:</strong> Hibah donor diakui saat diterima atau timbulnya hak penerimaan yang dapat diukur secara andal.</li>
                        </ul>

                        <h4 className="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 mt-4">3. KAS DAN SETARA KAS</h4>
                        <p>Posisi kas likuid per akhir periode adalah sebesar <strong>{formatRupiah(assets.cash)}</strong>. Seluruh aset neto terikat dialokasikan sepenuhnya untuk pelaksanaan program konservasi pesisir sesuai dengan perjanjian donor.</p>
                    </div>
                )}

                {/* Tanda Tangan Resmi Pengurus */}
                <OfficialSignatures />
            </div>
        </div>
    );
};

// ==========================================
// 4. MODAL PENGATURAN & SINKRONISASI CLOUD
// ==========================================
const SettingsModal = ({ isOpen, onClose, transactions, onDataReplaced, showToast }) => {
    if (!isOpen) return null;

    const supaInitial = StorageService.getSupabaseConfig();
    const [supaUrl, setSupaUrl] = React.useState(supaInitial.url);
    const [supaKey, setSupaKey] = React.useState(supaInitial.key);
    const [isTestingSupa, setIsTestingSupa] = React.useState(false);
    const [isSyncingSupa, setIsSyncingSupa] = React.useState(false);

    const [gasUrl, setGasUrl] = React.useState(StorageService.getGasUrl());
    const [orgProfile, setOrgProfile] = React.useState(StorageService.getOrgProfile());
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('supabase'); // 'supabase', 'cloud', 'profile', 'backup', 'security'
    const [pinForm, setPinForm] = React.useState({ oldPin: '', newPin: '', confirmPin: '' });

    const handleSaveSupabase = (e) => {
        if (e) e.preventDefault();
        StorageService.setSupabaseConfig(supaUrl, supaKey);
        showToast({ title: 'Kredensial Disimpan', message: 'Koneksi Supabase untuk MCC berhasil disimpan di memori.', type: 'success' });
    };

    const handleTestSupabase = async () => {
        if (!supaUrl || !supaKey) {
            showToast({ title: 'Data Belum Lengkap', message: 'Masukkan Project URL dan Anon Key Supabase terlebih dahulu.', type: 'error' });
            return;
        }
        setIsTestingSupa(true);
        try {
            const res = await StorageService.testSupabaseConnection(supaUrl, supaKey);
            if (res.success) {
                showToast({ title: 'Koneksi Sukses!', message: 'Terhubung ke database Supabase MCC (tabel mcc_transactions aktif).', type: 'success' });
            } else {
                showToast({ title: 'Koneksi Gagal', message: res.message, type: 'error' });
            }
        } finally {
            setIsTestingSupa(false);
        }
    };

    const handlePullFromSupabase = async () => {
        if (!supaUrl || !supaKey) {
            showToast({ title: 'Kredensial Belum Lengkap', message: 'Masukkan URL dan Anon Key Supabase terlebih dahulu.', type: 'error' });
            return;
        }
        StorageService.setSupabaseConfig(supaUrl, supaKey);
        setIsSyncingSupa(true);
        try {
            const res = await StorageService.pullFromSupabase();
            if (res.success && res.data) {
                onDataReplaced(res.data);
                showToast({ title: 'Tarik Data Berhasil', message: `Berhasil mengunduh ${res.data.length} transaksi dari database Supabase.`, type: 'success' });
            } else {
                showToast({ title: 'Tarik Data Gagal', message: res.error || 'Periksa izin RLS dan tabel Supabase.', type: 'error' });
            }
        } finally {
            setIsSyncingSupa(false);
        }
    };

    const handlePushToSupabase = async () => {
        if (!supaUrl || !supaKey) {
            showToast({ title: 'Kredensial Belum Lengkap', message: 'Masukkan URL dan Anon Key Supabase terlebih dahulu.', type: 'error' });
            return;
        }
        StorageService.setSupabaseConfig(supaUrl, supaKey);
        setIsSyncingSupa(true);
        try {
            const res = await StorageService.pushToSupabase(transactions);
            if (res.success) {
                showToast({ title: 'Upload Berhasil', message: `${res.count} mutasi kas MCC berhasil disimpan ke database Supabase.`, type: 'success' });
            } else {
                showToast({ title: 'Upload Gagal', message: res.error || 'Periksa konfigurasi tabel mcc_transactions.', type: 'error' });
            }
        } finally {
            setIsSyncingSupa(false);
        }
    };

    const handleChangePin = async (e) => {
        e.preventDefault();
        if (!pinForm.oldPin || pinForm.oldPin.length !== 6) {
            showToast({ title: 'Gagal', message: 'Masukkan 6 digit PIN lama.', type: 'error' });
            return;
        }
        const isOldValid = await StorageService.verifyPin(pinForm.oldPin);
        if (!isOldValid) {
            showToast({ title: 'PIN Lama Salah', message: 'PIN lama yang Anda masukkan tidak cocok.', type: 'error' });
            return;
        }
        if (!pinForm.newPin || pinForm.newPin.length !== 6 || !/^\d+$/.test(pinForm.newPin)) {
            showToast({ title: 'Format Tidak Sesuai', message: 'PIN baru harus tepat 6 digit angka.', type: 'error' });
            return;
        }
        if (pinForm.newPin !== pinForm.confirmPin) {
            showToast({ title: 'Tidak Cocok', message: 'Konfirmasi PIN baru tidak sama.', type: 'error' });
            return;
        }

        const saved = await StorageService.setAdminPin(pinForm.newPin);
        if (saved) {
            setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
            showToast({ title: 'PIN Berhasil Diubah', message: 'PIN Admin 6 digit berhasil diperbarui.', type: 'success' });
        }
    };

    const handleSaveGasUrl = (e) => {
        e.preventDefault();
        StorageService.setGasUrl(gasUrl);
        showToast({ title: 'URL Tersimpan', message: 'Endpoint Google Apps Script berhasil diperbarui.', type: 'success' });
    };

    const handlePushToCloud = async () => {
        if (!gasUrl || gasUrl.includes("CONTOH_KODE_DEPLOYMENT")) {
            showToast({ title: 'URL Belum Dikonfigurasi', message: 'Masukkan URL Web App Apps Script terlebih dahulu.', type: 'error' });
            return;
        }

        setIsSyncing(true);
        try {
            const res = await StorageService.pushToCloud(transactions, gasUrl);
            if (res.success) {
                showToast({ title: 'Sinkronisasi Berhasil', message: `${transactions.length} mutasi kas telah diunggah ke Google Sheets.`, type: 'success' });
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            showToast({ title: 'Sinkronisasi Gagal', message: err.message || 'Periksa koneksi atau URL Apps Script.', type: 'error' });
        } finally {
            setIsSyncing(false);
        }
    };

    const handlePullFromCloud = async () => {
        if (!gasUrl || gasUrl.includes("CONTOH_KODE_DEPLOYMENT")) {
            showToast({ title: 'URL Belum Dikonfigurasi', message: 'Masukkan URL Web App Apps Script terlebih dahulu.', type: 'error' });
            return;
        }

        setIsSyncing(true);
        try {
            const data = await StorageService.pullFromCloud(gasUrl);
            if (Array.isArray(data) && data.length > 0) {
                onDataReplaced(data);
                showToast({ title: 'Data Diperbarui', message: `Berhasil mengunduh ${data.length} transaksi dari Google Sheets.`, type: 'success' });
            } else {
                showToast({ title: 'Tidak Ada Data', message: 'Tidak ditemukan transaksi di spreadsheet.', type: 'info' });
            }
        } catch (err) {
            showToast({ title: 'Unduh Gagal', message: err.message || 'Gagal terhubung ke Google Sheets.', type: 'error' });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        StorageService.saveOrgProfile(orgProfile);
        showToast({ title: 'Profil Diperbarui', message: 'Data legalitas dan pejabat MCC telah disimpan.', type: 'success' });
    };

    const handleBackupDownload = () => {
        ExportService.exportBackupJson(transactions);
        showToast({ title: 'Backup Siap', message: 'File JSON database telah diunduh.', type: 'success' });
    };

    const handleRestoreUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (Array.isArray(parsed)) {
                    onDataReplaced(parsed);
                    showToast({ title: 'Restore Berhasil', message: `${parsed.length} transaksi dipulihkan dari cadangan.`, type: 'success' });
                    onClose();
                } else {
                    throw new Error("Format cadangan tidak valid.");
                }
            } catch (err) {
                showToast({ title: 'Restore Gagal', message: err.message, type: 'error' });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in no-print">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center">
                            <i className="fas fa-sliders text-base"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800">Pengaturan Sistem Keuangan</h3>
                            <p className="text-[11px] text-slate-400">Integrasi Google Sheets Cloud, Profil Entitas, dan Database</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center transition">
                        <i className="fas fa-times text-xs"></i>
                    </button>
                </div>

                {/* Tab Navigasi */}
                <div className="flex space-x-2 sm:space-x-3 border-b border-slate-100 mt-4 text-xs font-bold overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <button
                        onClick={() => setActiveTab('supabase')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'supabase' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-bolt mr-1.5 text-amber-500"></i> Supabase DB
                    </button>
                    <button
                        onClick={() => setActiveTab('cloud')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'cloud' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fab fa-google-drive mr-1.5"></i> Google Sheets
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'profile' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-building mr-1.5"></i> Profil MCC
                    </button>
                    <button
                        onClick={() => setActiveTab('backup')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'backup' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-database mr-1.5"></i> Backup & Reset
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'security' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-shield-halved mr-1.5"></i> PIN Admin
                    </button>
                </div>

                <div className="pt-4">
                    {/* Tab 0: Supabase Database (Project Terpisah MCC) */}
                    {activeTab === 'supabase' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs text-slate-700 flex items-start space-x-2.5">
                                <i className="fas fa-database text-[#00a884] text-base mt-0.5"></i>
                                <div>
                                    <span className="font-bold text-slate-800 block">Database Terpisah Khusus MCC (Tabel: mcc_transactions)</span>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Proyek ini berdiri sendiri dan tidak terhubung ke proyek lain. Jalankan file <code className="bg-white px-1.5 py-0.5 rounded text-teal-800 font-mono text-[10px] font-bold border border-teal-200">supabase_setup.sql</code> di Supabase SQL Editor Anda.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Supabase Project URL</label>
                                    <input 
                                        type="url" 
                                        value={supaUrl} 
                                        onChange={e => setSupaUrl(e.target.value)} 
                                        placeholder="https://[project-ref].supabase.co"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Supabase Anon Public Key (anon key)</label>
                                    <input 
                                        type="password" 
                                        value={supaKey} 
                                        onChange={e => setSupaKey(e.target.value)} 
                                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <button 
                                        type="button" 
                                        onClick={handleTestSupabase}
                                        disabled={isTestingSupa}
                                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center disabled:opacity-50"
                                    >
                                        <i className={`fas ${isTestingSupa ? 'fa-spinner fa-spin' : 'fa-plug'} mr-1.5 text-slate-500`}></i>
                                        <span>{isTestingSupa ? 'Menguji...' : 'Uji Koneksi'}</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleSaveSupabase}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition flex items-center shadow-xs"
                                    >
                                        <i className="fas fa-save mr-1.5"></i>
                                        <span>Simpan Kredensial</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                                <span className="text-[11px] font-bold text-slate-700 block">Sinkronisasi Database Cloud MCC</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={handlePullFromSupabase}
                                        disabled={isSyncingSupa}
                                        className="py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center disabled:opacity-50 shadow-xs"
                                    >
                                        <i className={`fas ${isSyncingSupa ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-down'} mr-1.5 text-teal-600`}></i>
                                        <span>Tarik Data (Pull)</span>
                                    </button>
                                    <button 
                                        onClick={handlePushToSupabase}
                                        disabled={isSyncingSupa}
                                        className="py-2.5 bg-[#00a884] hover:bg-[#008f70] text-white rounded-xl text-xs font-bold transition flex items-center justify-center disabled:opacity-50 shadow-sm"
                                    >
                                        <i className={`fas ${isSyncingSupa ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'} mr-1.5`}></i>
                                        <span>Upload Lokal (Push)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 1: Google Sheets */}
                    {activeTab === 'cloud' && (
                        <div className="space-y-4">
                            <form onSubmit={handleSaveGasUrl} className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Web App URL (Google Apps Script)</label>
                                    <input 
                                        type="url" 
                                        value={gasUrl} 
                                        onChange={e => setGasUrl(e.target.value)} 
                                        placeholder="https://script.google.com/macros/s/.../exec"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition">
                                        Simpan URL Endpoint
                                    </button>
                                </div>
                            </form>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                                <span className="text-[11px] font-bold text-slate-700 block">Aksi Sinkronisasi Dua Arah</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={handlePullFromCloud}
                                        disabled={isSyncing}
                                        className="py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center disabled:opacity-50"
                                    >
                                        <i className="fas fa-cloud-arrow-down mr-1.5 text-teal-600"></i>
                                        <span>Ambil dari Cloud (Pull)</span>
                                    </button>
                                    <button 
                                        onClick={handlePushToCloud}
                                        disabled={isSyncing}
                                        className="py-2.5 bg-[#00a884] hover:bg-[#008f70] text-white rounded-xl text-xs font-bold transition flex items-center justify-center disabled:opacity-50 shadow-sm"
                                    >
                                        <i className="fas fa-cloud-arrow-up mr-1.5"></i>
                                        <span>Kirim ke Cloud (Push)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Profil Organisasi */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Lembaga / Yayasan</label>
                                <input 
                                    type="text" 
                                    value={orgProfile.name} 
                                    onChange={e => setOrgProfile({...orgProfile, name: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Legalitas / SK Kemenkumham</label>
                                <input 
                                    type="text" 
                                    value={orgProfile.legal} 
                                    onChange={e => setOrgProfile({...orgProfile, legal: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Pimpinan / Direktur</label>
                                    <input 
                                        type="text" 
                                        value={orgProfile.leaderName} 
                                        onChange={e => setOrgProfile({...orgProfile, leaderName: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Jabatan Pimpinan</label>
                                    <input 
                                        type="text" 
                                        value={orgProfile.leaderTitle} 
                                        onChange={e => setOrgProfile({...orgProfile, leaderTitle: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" 
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Bendahara / Keuangan</label>
                                    <input 
                                        type="text" 
                                        value={orgProfile.financeName} 
                                        onChange={e => setOrgProfile({...orgProfile, financeName: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Jabatan Keuangan</label>
                                    <input 
                                        type="text" 
                                        value={orgProfile.financeTitle} 
                                        onChange={e => setOrgProfile({...orgProfile, financeTitle: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" 
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button type="submit" className="px-5 py-2 bg-[#00a884] hover:bg-[#008f70] text-white font-bold rounded-xl text-xs shadow-sm transition">
                                    Simpan Profil
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 3: Backup & Restore */}
                    {activeTab === 'backup' && (
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-xs text-slate-800 block">Unduh Cadangan Database</span>
                                    <span className="text-[11px] text-slate-400">Simpan seluruh riwayat kas dalam format file .JSON</span>
                                </div>
                                <button 
                                    onClick={handleBackupDownload}
                                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition flex items-center"
                                >
                                    <i className="fas fa-download mr-1"></i> Unduh
                                </button>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-xs text-slate-800 block">Pulihkan dari File Cadangan</span>
                                    <span className="text-[11px] text-slate-400">Timpa data dengan file JSON cadangan sebelumnya</span>
                                </div>
                                <label className="px-3 py-1.5 bg-[#00a884] hover:bg-[#008f70] text-white rounded-lg text-xs font-bold cursor-pointer transition flex items-center shadow-sm">
                                    <i className="fas fa-upload mr-1"></i> Upload
                                    <input type="file" accept=".json" onChange={handleRestoreUpload} className="hidden" />
                                </label>
                            </div>

                            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between mt-4">
                                <div>
                                    <span className="font-bold text-xs text-rose-800 block">Reset ke Data Awal Demo</span>
                                    <span className="text-[11px] text-rose-500">Kembalikan data ke transaksi seed bawaan MCC</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (confirm("Reset seluruh data ke transaksi awal bawaan?")) {
                                            const resetData = StorageService.resetToDemo();
                                            onDataReplaced(resetData);
                                            showToast({ title: 'Data Direset', message: 'Database telah dikembalikan ke data awal.', type: 'info' });
                                            onClose();
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
                                >
                                    Reset Demo
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Keamanan & PIN Admin */}
                    {activeTab === 'security' && (
                        <div className="space-y-4">
                            <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-100 text-xs text-slate-700">
                                <p className="font-bold text-teal-900 mb-1 flex items-center">
                                    <i className="fas fa-shield-halved mr-1.5 text-[#00a884]"></i> Proteksi PIN Keamanan (Standar Boetje-Etty)
                                </p>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                    PIN Admin 6 digit melindungi pencatatan mutasi kas, pengubahan/edit, penghapusan data, dan menu konfigurasi sensitif.
                                </p>
                            </div>

                            <form onSubmit={handleChangePin} className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">PIN Lama (6 Digit)</label>
                                    <input 
                                        type="password" 
                                        maxLength={6} 
                                        value={pinForm.oldPin} 
                                        onChange={e => setPinForm({...pinForm, oldPin: e.target.value.replace(/\D/g, '')})}
                                        placeholder="Contoh: 123456" 
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">PIN Baru (6 Digit Angka)</label>
                                        <input 
                                            type="password" 
                                            maxLength={6} 
                                            value={pinForm.newPin} 
                                            onChange={e => setPinForm({...pinForm, newPin: e.target.value.replace(/\D/g, '')})}
                                            placeholder="6 Digit angka baru" 
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Ulangi PIN Baru</label>
                                        <input 
                                            type="password" 
                                            maxLength={6} 
                                            value={pinForm.confirmPin} 
                                            onChange={e => setPinForm({...pinForm, confirmPin: e.target.value.replace(/\D/g, '')})}
                                            placeholder="Konfirmasi 6 digit" 
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-between items-center">
                                    <button 
                                        type="button" 
                                        onClick={async () => {
                                            await StorageService.setAdminPin(DEFAULT_ADMIN_PIN);
                                            setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
                                            showToast({ title: 'Reset PIN', message: 'PIN telah dikembalikan ke standar awal: 123456', type: 'info' });
                                        }}
                                        className="text-[11px] text-slate-400 hover:text-slate-600 underline font-medium"
                                    >
                                        Kembalikan ke Default (123456)
                                    </button>
                                    <button type="submit" className="px-5 py-2 bg-[#00a884] hover:bg-[#008f70] text-white font-bold rounded-xl text-xs shadow-sm transition">
                                        Simpan PIN Baru
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 5. MODAL OTORISASI LOGIN ADMIN (STANDAR BOETJE-ETTY)
// ==========================================
const LoginModal = ({ isOpen, onClose, onSuccess, showToast }) => {
    const [pin, setPin] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [isError, setIsError] = React.useState(false);
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (isOpen) {
            setPin('');
            setIsSuccess(false);
            setIsError(false);
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 150);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePinInput = (val) => {
        val = val.replace(/\D/g, '').slice(0, 6);
        setPin(val);
        setIsError(false);

        if (val.length === 6) {
            setTimeout(() => verifyInput(val), 100);
        }
    };

    const verifyInput = async (valToVerify) => {
        const pinToTest = valToVerify || pin;
        if (pinToTest.length !== 6) return;

        const isValid = await StorageService.verifyPin(pinToTest);
        if (isValid) {
            setIsSuccess(true);
            setTimeout(() => {
                StorageService.setAdminLoggedIn(true);
                onSuccess();
                showToast({ title: 'Akses Diberikan', message: 'Selamat datang, Anda kini dalam Mode Admin / Bendahara.', type: 'success' });
            }, 550);
        } else {
            setIsError(true);
            showToast({ title: 'PIN Salah!', message: 'PIN yang Anda masukkan salah. Silakan coba lagi.', type: 'error' });
            setTimeout(() => {
                setPin('');
                setIsError(false);
                if (inputRef.current) inputRef.current.focus();
            }, 750);
        }
    };

    const handleKeypad = (char) => {
        if (char === 'clear') {
            setPin('');
            setIsError(false);
        } else if (char === 'back') {
            setPin(prev => prev.slice(0, -1));
            setIsError(false);
        } else {
            if (pin.length < 6) {
                const nextVal = pin + char;
                setPin(nextVal);
                setIsError(false);
                if (nextVal.length === 6) {
                    setTimeout(() => verifyInput(nextVal), 100);
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in no-print">
            <div className="bg-white w-full max-w-sm rounded-[28px] p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                    {/* Animated Icon Box (Standar Boetje-Etty) */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 flex-shrink-0 ${
                        isSuccess 
                            ? 'bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50 scale-110' 
                            : 'bg-teal-50 text-[#00a884] ring-8 ring-teal-50/40'
                    }`}>
                        <i className={`fas ${isSuccess ? 'fa-lock-open text-xl' : 'fa-lock text-xl'}`}></i>
                    </div>

                    <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-1.5">Otorisasi Bendahara</h3>
                    <p className="text-xs text-slate-500 mb-6 font-medium px-2 leading-relaxed">
                        Silakan masukkan 6 digit PIN keamanan untuk memverifikasi identitas Anda dan mengakses kelola kas.
                    </p>

                    {/* 6 PIN Display Boxes (Standar Boetje-Etty) */}
                    <div className={`w-full relative mb-5 flex justify-center gap-1.5 sm:gap-2.5 ${isError ? 'animate-shake' : ''}`}>
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                            const isFilled = idx < pin.length;
                            const isCurrent = idx === pin.length && isFocused;

                            let boxStyle = "w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center transition-all ";
                            if (isError) {
                                boxStyle += "border-rose-400 bg-rose-50";
                            } else if (isFilled) {
                                boxStyle += "border-[#00a884] bg-white shadow-xs transform scale-[1.04]";
                            } else if (isCurrent) {
                                boxStyle += "border-teal-300 bg-white shadow-xs";
                            } else {
                                boxStyle += "border-slate-200 bg-slate-50/60";
                            }

                            return (
                                <div key={idx} className={boxStyle}>
                                    {isFilled && (
                                        <div className={`w-3 h-3 rounded-full shadow-xs ${isError ? 'bg-rose-500' : 'bg-slate-800'}`}></div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Hidden Native Input untuk Keyboard Mobile/Desktop */}
                        <input
                            ref={inputRef}
                            type="tel"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="off"
                            value={pin}
                            onChange={(e) => handlePinInput(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                    </div>

                    {/* Touch Numeric Keypad untuk Kenyamanan Smartphone */}
                    <div className="grid grid-cols-3 gap-2 w-full mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleKeypad(String(num))}
                                className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-base transition flex items-center justify-center border border-slate-100 active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleKeypad('clear')}
                            className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-xs transition flex items-center justify-center border border-slate-100"
                        >
                            C
                        </button>
                        <button
                            type="button"
                            onClick={() => handleKeypad('0')}
                            className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-base transition flex items-center justify-center border border-slate-100 active:scale-95"
                        >
                            0
                        </button>
                        <button
                            type="button"
                            onClick={() => handleKeypad('back')}
                            className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition flex items-center justify-center border border-slate-100"
                        >
                            <i className="fas fa-delete-left text-sm"></i>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => verifyInput(pin)}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold rounded-2xl transition text-xs shadow-md"
                    >
                        Verifikasi Akses
                    </button>

                    <p className="text-[11px] text-slate-400 mt-3">
                        PIN Standar: <span className="font-mono font-bold text-slate-600">123456</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 5. KOMPONEN UTAMA APLIKASI (APP SHELL)
// ==========================================
const App = () => {
    const [state, dispatch] = React.useReducer(transactionReducer, {
        past: [],
        present: StorageService.getTransactions(),
        future: []
    });

    const [view, setView] = React.useState('dashboard'); // 'dashboard', 'journal', 'reports'
    const [isSidebarOpen, setSidebarOpen] = React.useState(false);
    const [isSettingsOpen, setSettingsOpen] = React.useState(false);
    const [toast, setToast] = React.useState(null);

    // Mode Autentikasi Admin (Standar Boetje-Etty)
    const [isAdmin, setIsAdmin] = React.useState(() => StorageService.isAdminLoggedIn());
    const [isLoginModalOpen, setLoginModalOpen] = React.useState(false);
    const [pendingAction, setPendingAction] = React.useState(null);

    const requireAdmin = (actionCallback) => {
        if (isAdmin) {
            if (actionCallback) actionCallback();
        } else {
            setPendingAction(() => actionCallback);
            setLoginModalOpen(true);
        }
    };

    const handleLoginSuccess = () => {
        setIsAdmin(true);
        setLoginModalOpen(false);
        if (pendingAction) {
            setTimeout(() => {
                pendingAction();
                setPendingAction(null);
            }, 100);
        }
    };

    const handleLogoutAdmin = () => {
        if (confirm("Apakah Anda yakin ingin keluar dari Mode Admin/Bendahara? Anda tidak akan bisa mengedit data lagi.")) {
            StorageService.setAdminLoggedIn(false);
            setIsAdmin(false);
            showToast({ title: 'Logout Berhasil', message: 'Anda telah keluar dari Mode Admin. Mode Hanya Lihat aktif.', type: 'info' });
        }
    };

    // Otomatis buka sidebar jika di layar desktop (>= 768px)
    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            setSidebarOpen(true);
        }
    }, []);

    const showToast = ({ title, message, type = 'info' }) => {
        setToast({ title, message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleNavigate = (newView) => {
        setView(newView);
    };

    React.useEffect(() => {
        StorageService.saveTransactions(state.present);
    }, [state.present]);

    // Otomatis tarik data dari Supabase MCC saat aplikasi dibuka (jika kredensial sudah dikonfigurasi)
    React.useEffect(() => {
        const supaConfig = StorageService.getSupabaseConfig();
        if (supaConfig.url && supaConfig.key) {
            StorageService.pullFromSupabase().then(res => {
                if (res.success && res.data && res.data.length > 0) {
                    dispatch({ type: 'SET_INITIAL', payload: res.data });
                    console.log(`✅ Berhasil menyinkronkan ${res.data.length} transaksi dari Supabase MCC.`);
                }
            }).catch(e => console.warn("Supabase initial sync:", e));
        }
    }, []);

    return (
        <div className="flex h-screen bg-[#f4f7fb] font-sans overflow-hidden text-slate-800">
            {/* Sidebar Hanya untuk Desktop (Di Smartphone Sepenuhnya Dihilangkan & Dipindahkan ke Bottom Bar) */}
            <aside className={`hidden md:flex bg-white border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300 z-20 no-print relative h-full shadow-sm ${
                isSidebarOpen ? 'w-64' : 'w-20'
            }`}>
                {/* Brand Header */}
                <div className="px-4 flex items-center space-x-3 border-b border-slate-200 h-16 overflow-hidden">
                    <MCCLogo className="w-10 h-10" />
                    <div className={`transition-opacity duration-200 whitespace-nowrap ${!isSidebarOpen && 'md:opacity-0 md:hidden'}`}>
                        <h1 className="text-sm font-black tracking-wide text-slate-800 leading-tight">OLIVAFINANCE</h1>
                        <p className="text-[10px] text-[#00a884] font-bold tracking-wider uppercase leading-none mt-0.5">Moluccas Coastal Care</p>
                    </div>
                </div>
                
                {/* Navigasi Menu Desktop */}
                <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto hide-scrollbar">
                    <button 
                        onClick={() => handleNavigate('dashboard')} 
                        className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all ${view === 'dashboard' ? 'bg-[#00a884] text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'} ${!isSidebarOpen && 'md:justify-center'}`} 
                        title="Dashboard"
                    >
                        <i className="fas fa-chart-line w-5 text-center text-sm"></i>
                        <span className={`ml-3 text-xs whitespace-nowrap ${!isSidebarOpen && 'md:hidden'}`}>Dashboard</span>
                    </button>

                    <button 
                        onClick={() => handleNavigate('journal')} 
                        className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all ${view === 'journal' ? 'bg-[#00a884] text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'} ${!isSidebarOpen && 'md:justify-center'}`} 
                        title="Buku Jurnal Umum"
                    >
                        <i className="fas fa-book-journal-whills w-5 text-center text-sm"></i>
                        <span className={`ml-3 text-xs whitespace-nowrap ${!isSidebarOpen && 'md:hidden'}`}>Buku Jurnal Umum</span>
                    </button>

                    <button 
                        onClick={() => handleNavigate('reports')} 
                        className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all ${view === 'reports' ? 'bg-[#00a884] text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'} ${!isSidebarOpen && 'md:justify-center'}`} 
                        title="Laporan ISAK 35"
                    >
                        <i className="fas fa-file-invoice-dollar w-5 text-center text-sm"></i>
                        <span className={`ml-3 text-xs whitespace-nowrap ${!isSidebarOpen && 'md:hidden'}`}>Laporan ISAK 35</span>
                    </button>
                </nav>

                {/* Profil Lembaga / Status Pengguna di Bawah Sidebar */}
                <div className="p-3 border-t border-slate-100 bg-slate-50">
                    <div className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-2 py-1.5' : 'md:justify-center py-1.5'} rounded-xl text-left`}>
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-[#00a884] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                            <i className="fas fa-user-shield"></i>
                        </div>
                        <div className={`overflow-hidden ${!isSidebarOpen && 'md:hidden'}`}>
                            <p className="text-xs font-bold text-slate-800 truncate">Bendahara MCC</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">Standar ISAK 35</p>
                        </div>
                    </div>
                    {isSidebarOpen && (
                        <p className="text-[9px] text-slate-400 mt-2 px-2 text-center">
                            &copy; 2026 Yayasan MCC • v1.0
                        </p>
                    )}
                </div>
            </aside>

            {/* Area Konten Utama */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header Atas Responsif (Tinggi & Garis Bawah Presisi Sejajar h-16 dengan Sidebar) */}
                <header className="bg-white border-b border-slate-200 px-3 sm:px-6 h-16 flex items-center justify-between z-20 flex-shrink-0 no-print">
                    {/* Sisi Kiri: Logo di Smartphone & Toggle di Desktop */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Smartphone: Brand & Logo Langsung (Tanpa Tombol Hamburger Sidebar) */}
                        <div className="flex md:hidden items-center space-x-2.5">
                            <MCCLogo className="w-8 h-8" />
                            <div>
                                <h1 className="text-xs font-black tracking-wide text-slate-800 leading-tight">OLIVAFINANCE</h1>
                                <p className="text-[9px] text-[#00a884] font-bold tracking-wider uppercase leading-none">Moluccas Coastal Care</p>
                            </div>
                        </div>

                        {/* Desktop: Tombol Toggle Sidebar & Judul Halaman */}
                        <div className="hidden md:flex items-center space-x-3">
                            <button 
                                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                                title="Toggle Menu"
                            >
                                <i className="fas fa-bars text-sm"></i>
                            </button>
                            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                {view === 'dashboard' ? 'Sistem Informasi Manajemen Keuangan' : 
                                 view === 'journal' ? 'Buku Kas & Jurnal Mutasi Harian' : 'Pelaporan Akuntansi Entitas Nirlaba'}
                            </h2>
                        </div>
                    </div>

                    {/* Sisi Kanan: Status Admin & Pengaturan */}
                    <div className="flex items-center space-x-2">
                        <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                            <i className="fas fa-clock mr-1 text-slate-400"></i>
                            {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>

                        {/* Tombol Login / Logout Admin (Standar Boetje-Etty) */}
                        {isAdmin ? (
                            <button 
                                onClick={handleLogoutAdmin}
                                className="px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center shadow-xs active:scale-95"
                                title="Klik untuk Keluar dari Mode Admin"
                            >
                                <i className="fas fa-lock-open mr-1.5 text-emerald-600 text-xs"></i>
                                <span>Logout Admin</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => requireAdmin()}
                                className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center shadow-xs active:scale-95"
                                title="Login Admin untuk input & edit data"
                            >
                                <i className="fas fa-lock mr-1.5 text-slate-400 text-xs"></i>
                                <span>Login Admin</span>
                            </button>
                        )}

                        <button 
                            onClick={() => requireAdmin(() => setSettingsOpen(true))}
                            className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                            title="Pengaturan"
                        >
                            <i className="fas fa-cog mr-1.5 text-slate-500"></i>
                            <span>Pengaturan</span>
                        </button>
                    </div>
                </header>

                {/* Konten Halaman yang Dapat Digulir */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 pb-14 md:pb-6">
                    <div className="max-w-7xl mx-auto">
                        {view === 'dashboard' && (
                            <Dashboard 
                                transactions={state.present} 
                                onNavigateToJournal={() => handleNavigate('journal')}
                                onOpenNewTx={() => handleNavigate('journal')}
                                requireAdmin={requireAdmin}
                            />
                        )}
                        {view === 'journal' && (
                            <Journal 
                                state={state} 
                                dispatch={dispatch} 
                                onSyncRequest={() => requireAdmin(() => setSettingsOpen(true))}
                                showToast={showToast}
                                isAdmin={isAdmin}
                                requireAdmin={requireAdmin}
                            />
                        )}
                        {view === 'reports' && <Reports transactions={state.present} />}
                    </div>
                    
                    {view !== 'dashboard' && (
                        <footer className="mt-8 py-4 border-t border-slate-200 text-center text-slate-400 text-[11px] no-print flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-2">
                            <p>&copy; {new Date().getFullYear()} Yayasan Moluccas Coastal Care (MCC). Berstandar ISAK 35.</p>
                            <p className="font-semibold text-slate-500">Olivafinance — Moluccas Coastal Care</p>
                        </footer>
                    )}
                </div>

                {/* Mobile Bottom Navigation Bar (Desain Ringkas, Ramping & Proporsional) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-30 px-2 py-1 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)] no-print">
                    <button 
                        onClick={() => handleNavigate('dashboard')} 
                        className={`flex-1 flex flex-col items-center py-0.5 rounded-lg transition ${view === 'dashboard' ? 'text-[#00a884]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <i className="fas fa-chart-line text-sm"></i>
                        <span className={`text-[9px] mt-0.5 tracking-tight ${view === 'dashboard' ? 'font-black text-[#00a884]' : 'font-medium'}`}>Dashboard</span>
                    </button>
                    <button 
                        onClick={() => handleNavigate('journal')} 
                        className={`flex-1 flex flex-col items-center py-0.5 rounded-lg transition ${view === 'journal' ? 'text-[#00a884]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <i className="fas fa-book-journal-whills text-sm"></i>
                        <span className={`text-[9px] mt-0.5 tracking-tight ${view === 'journal' ? 'font-black text-[#00a884]' : 'font-medium'}`}>Jurnal</span>
                    </button>
                    <button 
                        onClick={() => handleNavigate('reports')} 
                        className={`flex-1 flex flex-col items-center py-0.5 rounded-lg transition ${view === 'reports' ? 'text-[#00a884]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <i className="fas fa-file-invoice-dollar text-sm"></i>
                        <span className={`text-[9px] mt-0.5 tracking-tight ${view === 'reports' ? 'font-black text-[#00a884]' : 'font-medium'}`}>Laporan</span>
                    </button>
                    <button 
                        onClick={() => requireAdmin(() => setSettingsOpen(true))} 
                        className="flex-1 flex flex-col items-center py-0.5 rounded-lg text-slate-400 hover:text-slate-600 transition"
                    >
                        <i className="fas fa-sliders text-sm"></i>
                        <span className="text-[9px] mt-0.5 tracking-tight font-medium">Pengaturan</span>
                    </button>
                </nav>
            </main>

            {/* Modal Otorisasi Login Admin (Standar Boetje-Etty) */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => {
                    setLoginModalOpen(false);
                    setPendingAction(null);
                }}
                onSuccess={handleLoginSuccess}
                showToast={showToast}
            />

            {/* Modal Pengaturan & Integrasi */}
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setSettingsOpen(false)} 
                transactions={state.present}
                onDataReplaced={(newData) => dispatch({ type: 'SET_INITIAL', payload: newData })}
                showToast={showToast}
            />

            {/* Toast Notifications */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

// Mount React Root
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
