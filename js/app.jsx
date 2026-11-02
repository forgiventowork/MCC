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
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Ikhtisar keuangan & akuntabilitas standar ISAK 35 Yayasan Moluccas Coastal Care</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {/* Search Bar Input */}
                    <div className="relative w-full sm:w-56">
                        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input 
                            type="text" 
                            placeholder="Cari transaksi..."
                            onClick={onNavigateToJournal}
                            readOnly
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
                        />
                    </div>

                    {/* Action Button: Catat Transaksi Baru (Otorisasi Admin) */}
                    <button 
                        onClick={() => requireAdmin ? requireAdmin(onOpenNewTx) : onOpenNewTx()}
                        className="w-full sm:w-auto px-4 py-2 bg-[#00a884] hover:bg-[#008f70] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center transition"
                    >
                        <i className="fas fa-plus mr-1.5 text-xs"></i> Catat Transaksi
                    </button>
                </div>
            </div>

            {/* Top 5 KPI Metric Cards (Sempurna & Utuh di Mode Smartphone) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {/* KPI 1: KAS & BANK */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#00a884] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                                <i className="fas fa-building-columns text-sm sm:text-base"></i>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                Aktif
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
                                KAS & BANK LIKUID
                            </span>
                            <span className="text-[13px] sm:text-sm lg:text-xs xl:text-sm font-black text-slate-800 font-mono-num block mt-1 whitespace-nowrap">
                                {formatRupiah(totalCash)}
                            </span>
                        </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
                        <span>Saldo Operasional</span>
                        <span className="text-emerald-600 font-bold">Likuid</span>
                    </div>
                </div>

                {/* KPI 2: PENERIMAAN HIBAH */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0d9488] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                                <i className="fas fa-hand-holding-dollar text-sm sm:text-base"></i>
                            </div>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                {transactions.filter(t => t.type === 'Penerimaan').length} Tx
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
                                TOTAL PENERIMAAN
                            </span>
                            <span className="text-[13px] sm:text-sm lg:text-xs xl:text-sm font-black text-emerald-600 font-mono-num block mt-1 whitespace-nowrap">
                                +{formatRupiah(totalIncome)}
                            </span>
                        </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
                        <span>Hibah & Donasi</span>
                        <span className="font-bold text-slate-700">Masuk</span>
                    </div>
                </div>

                {/* KPI 3: BEBAN TERBAYAR */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#f59e0b] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                                <i className="fas fa-receipt text-sm sm:text-base"></i>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                {transactions.filter(t => t.type === 'Pengeluaran').length} Tx
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
                                BEBAN PROGRAM & OPS
                            </span>
                            <span className="text-[13px] sm:text-sm lg:text-xs xl:text-sm font-black text-rose-600 font-mono-num block mt-1 whitespace-nowrap">
                                -{formatRupiah(totalExpense)}
                            </span>
                        </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
                        <span>Realisasi Dana</span>
                        <span className="font-bold text-rose-600">Terpakai</span>
                    </div>
                </div>

                {/* KPI 4: SURPLUS (DEFISIT) */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#10b981] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                                <i className="fas fa-arrow-trend-up text-sm sm:text-base"></i>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                ISAK 35
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
                                SURPLUS BERJALAN
                            </span>
                            <span className={`text-[13px] sm:text-sm lg:text-xs xl:text-sm font-black font-mono-num block mt-1 whitespace-nowrap ${surplusDeficit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {surplusDeficit >= 0 ? '+' : ''}{formatRupiah(surplusDeficit)}
                            </span>
                        </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
                        <span>Kenaikan Aset Neto</span>
                        <span className="font-bold text-emerald-600">Surplus</span>
                    </div>
                </div>

                {/* KPI 5: KETAHANAN KAS */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition col-span-2 md:col-span-1">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0284c7] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                                <i className="fas fa-paper-plane text-sm sm:text-base"></i>
                            </div>
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                                Efisiensi {programEfficiencyRatio}%
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
                                KETAHANAN KAS
                            </span>
                            <span className="text-[13px] sm:text-sm lg:text-xs xl:text-sm font-black text-slate-800 font-mono-num block mt-1 whitespace-nowrap">
                                {runwayMonths} Bulan
                            </span>
                        </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
                        <span>Rasio Operasional</span>
                        <span className="font-bold text-teal-600 font-mono-num">Aman</span>
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
// 1.5. KOMPRESI FOTO & MODAL BUKTI TRANSAKSI (FITUR 1)
// ==========================================
const compressImage = (file, callback, onError) => {
    if (!file) return;
    if (file.type === 'application/pdf') {
        if (file.size > 3 * 1024 * 1024) {
            if (onError) onError("Ukuran file PDF maksimal 3MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result, file.name, 'pdf');
        reader.readAsDataURL(file);
        return;
    }

    if (!file.type.startsWith('image/')) {
        if (onError) onError("Hanya mendukung file foto gambar (JPG, PNG) atau dokumen PDF.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            callback(dataUrl, file.name, 'image');
        };
        img.onerror = () => {
            if (onError) onError("Gagal memproses file gambar.");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
};

const ReceiptModal = ({ isOpen, onClose, transaction }) => {
    if (!isOpen || !transaction || !transaction.receiptUrl) return null;

    const isPdf = transaction.receiptUrl.startsWith('data:application/pdf') || (transaction.receiptName && transaction.receiptName.toLowerCase().endsWith('.pdf'));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-receipt text-base"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800">Lampiran Bukti Transaksi</h3>
                            <p className="text-[11px] text-slate-400 font-mono-num">{transaction.voucherNo || '-'} &bull; {formatDateId(transaction.date)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center transition">
                        <i className="fas fa-times text-xs"></i>
                    </button>
                </div>

                <div className="py-2.5 px-3.5 my-3 text-xs bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center">
                    <div className="truncate mr-2">
                        <span className="font-bold text-slate-800 block truncate">{transaction.desc}</span>
                        <span className="text-[11px] text-slate-500">{transaction.category} ({transaction.restriction})</span>
                    </div>
                    <span className={`text-sm font-black font-mono-num whitespace-nowrap ${transaction.type === 'Penerimaan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatRupiah(transaction.amount)}
                    </span>
                </div>

                <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-slate-100/70 flex items-center justify-center p-2 min-h-[220px]">
                    {isPdf ? (
                        <div className="text-center p-6 space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
                                <i className="fas fa-file-pdf"></i>
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">Dokumen Kuitansi / Bukti PDF</p>
                                <p className="text-xs text-slate-400 mt-0.5">{transaction.receiptName || 'lampiran_kuitansi.pdf'}</p>
                            </div>
                            <a 
                                href={transaction.receiptUrl} 
                                download={transaction.receiptName || `Bukti_${transaction.voucherNo || 'MCC'}.pdf`}
                                className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                            >
                                <i className="fas fa-download mr-1.5"></i> Unduh File PDF
                            </a>
                        </div>
                    ) : (
                        <img 
                            src={transaction.receiptUrl} 
                            alt="Bukti Transaksi" 
                            className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-sm" 
                        />
                    )}
                </div>

                <div className="pt-3.5 flex justify-between items-center border-t border-slate-100 mt-3">
                    <span className="text-[11px] text-slate-400">Verifikasi Dokumen Keuangan MCC</span>
                    <div className="flex space-x-2">
                        <a 
                            href={transaction.receiptUrl} 
                            download={transaction.receiptName || `Bukti_${transaction.voucherNo || 'MCC'}.jpg`}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center"
                        >
                            <i className="fas fa-download mr-1.5 text-slate-500"></i> Unduh
                        </a>
                        <button 
                            onClick={onClose}
                            className="px-4 py-1.5 bg-[#00a884] hover:bg-[#008f70] text-white font-bold rounded-xl text-xs transition"
                        >
                            Tutup
                        </button>
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
        amount: '',
        receiptUrl: null,
        receiptName: ''
    };

    const [formData, setFormData] = React.useState(defaultForm);
    const [isEditing, setIsEditing] = React.useState(false);
    const [showFormModal, setShowFormModal] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterType, setFilterType] = React.useState('ALL');
    const [filterRestriction, setFilterRestriction] = React.useState('ALL');
    const [filterPeriod, setFilterPeriod] = React.useState('ALL'); // 'ALL', 'THIS_MONTH', 'LAST_MONTH', 'THIS_YEAR', 'CUSTOM'
    const [customStartDate, setCustomStartDate] = React.useState('');
    const [customEndDate, setCustomEndDate] = React.useState('');
    const [viewingReceipt, setViewingReceipt] = React.useState(null);

    const lockedDate = StorageService.getLockedDate();

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

        // Validasi Tutup Buku (Fitur 2)
        if (StorageService.isDateLocked(formData.date)) {
            showToast({ 
                title: 'Aksi Ditolak', 
                message: `Periode transaksi sampai tanggal ${formatDateId(StorageService.getLockedDate())} telah ditutup buku dan terkunci.`, 
                type: 'error' 
            });
            return;
        }

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
            // Catat Riwayat Audit (Fitur 3)
            StorageService.addAuditLog({
                action: 'UBAH',
                voucherNo: payload.voucherNo,
                desc: payload.desc,
                amount: payload.amount,
                details: `Mengubah transaksi ${payload.type} - ${payload.category} (${payload.restriction})`
            });
        } else {
            dispatch({ type: 'ADD_TRANSACTION', payload });
            showToast({ title: 'Transaksi Ditambahkan', message: `Transaksi baru berhasil dibukukan ke jurnal.`, type: 'success' });
            StorageService.syncTransactionToSupabase(payload, 'insert');
            // Catat Riwayat Audit (Fitur 3)
            StorageService.addAuditLog({
                action: 'TAMBAH',
                voucherNo: payload.voucherNo,
                desc: payload.desc,
                amount: payload.amount,
                details: `Pencatatan kas masuk/beban ${payload.type} - ${payload.category}`
            });
        }
        setShowFormModal(false);
        setFormData(defaultForm);
    };

    const [deleteTarget, setDeleteTarget] = React.useState(null);

    const handleEdit = (tx) => {
        if (StorageService.isDateLocked(tx.date)) {
            showToast({ 
                title: 'Aksi Ditolak', 
                message: `Transaksi ini berada di periode yang telah ditutup buku (${formatDateId(StorageService.getLockedDate())}).`, 
                type: 'warning' 
            });
            return;
        }
        setFormData({ ...tx });
        setIsEditing(true);
        setShowFormModal(true);
    };

    const handleDelete = (id, voucherNo, date, desc, amount) => {
        if (StorageService.isDateLocked(date)) {
            showToast({ 
                title: 'Aksi Ditolak', 
                message: `Transaksi ini berada di periode yang telah ditutup buku (${formatDateId(StorageService.getLockedDate())}).`, 
                type: 'warning' 
            });
            return;
        }
        setDeleteTarget({ id, voucherNo, date, desc, amount });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const { id, voucherNo, desc, amount } = deleteTarget;
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
        showToast({ title: 'Transaksi Dihapus', message: `Data telah dihapus dari jurnal umum.`, type: 'warning' });
        StorageService.syncTransactionToSupabase({ id }, 'delete');
        // Catat Riwayat Audit (Fitur 3)
        StorageService.addAuditLog({
            action: 'HAPUS',
            voucherNo: voucherNo || '-',
            desc: desc || 'Hapus mutasi kas',
            amount: amount || 0,
            details: `Penghapusan mutasi kas dari Buku Jurnal Umum`
        });
        setDeleteTarget(null);
    };

    // Filter transaksi termasuk Rentang Tanggal Fleksibel (Fitur 4)
    const filteredTransactions = present.filter(t => {
        const matchSearch = (t.desc || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (t.voucherNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'ALL' || t.type === filterType;
        const matchRest = filterRestriction === 'ALL' || t.restriction === filterRestriction;

        // Filter Rentang Tanggal Fleksibel
        let matchDate = true;
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonthStr = `${curYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

        if (filterPeriod === 'THIS_MONTH') {
            matchDate = t.date && t.date.startsWith(curMonthStr);
        } else if (filterPeriod === 'LAST_MONTH') {
            matchDate = t.date && t.date.startsWith(prevMonthStr);
        } else if (filterPeriod === 'THIS_YEAR') {
            matchDate = t.date && t.date.startsWith(String(curYear));
        } else if (filterPeriod === 'CUSTOM') {
            if (customStartDate && t.date < customStartDate) matchDate = false;
            if (customEndDate && t.date > customEndDate) matchDate = false;
        }

        return matchSearch && matchType && matchRest && matchDate;
    });

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window._currentJournalTransactions = filteredTransactions;
        }
    }, [filteredTransactions]);

    const sumIn = filteredTransactions.filter(t => t.type === 'Penerimaan').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const sumOut = filteredTransactions.filter(t => t.type === 'Pengeluaran').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const netFiltered = sumIn - sumOut;

    return (
        <div className="space-y-4 pb-12">
            {/* Banner Informasi Tutup Buku Jika Aktif (Fitur 2) */}
            {lockedDate && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900 no-print shadow-xs">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                            <i className="fas fa-lock"></i>
                        </div>
                        <div>
                            <span className="font-bold block">Periode Pembukuan Ditutup (Tutup Buku Aktif)</span>
                            <span className="text-[11px] text-amber-700">
                                Transaksi pada dan sebelum tanggal <strong>{formatDateId(lockedDate)}</strong> terkunci untuk menjaga akuntabilitas audit.
                            </span>
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => requireAdmin ? requireAdmin(() => onSyncRequest && onSyncRequest('lock')) : null}
                            className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition shadow-xs flex-shrink-0"
                        >
                            <i className="fas fa-gear mr-1.5"></i> Kelola Tutup Buku
                        </button>
                    )}
                </div>
            )}

            {/* Header Jurnal Eksekutif */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm no-print">
                <div>
                    <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            GENERAL LEDGER
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Buku Jurnal Umum</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Pencatatan mutasi kas harian dengan klasifikasi akun standar ISAK 35
                    </p>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                        <button 
                            onClick={() => {
                                let periodLabel = 'Semua Periode Transaksi';
                                if (filterPeriod === 'THIS_MONTH') {
                                    periodLabel = `Bulan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
                                } else if (filterPeriod === 'LAST_MONTH') {
                                    const prev = new Date();
                                    prev.setMonth(prev.getMonth() - 1);
                                    periodLabel = `Bulan ${prev.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
                                } else if (filterPeriod === 'THIS_YEAR') {
                                    periodLabel = `Tahun ${new Date().getFullYear()}`;
                                } else if (filterPeriod === 'CUSTOM') {
                                    const start = customStartDate ? formatDateId(customStartDate) : 'Awal';
                                    const end = customEndDate ? formatDateId(customEndDate) : 'Sekarang';
                                    periodLabel = `${start} s.d. ${end}`;
                                }
                                ExportService.printJournal(filteredTransactions, {
                                    filename: 'Buku_Jurnal_MCC',
                                    periodText: `Periode: ${periodLabel}`,
                                    org: StorageService.getOrgProfile()
                                });
                            }}
                            className="px-2.5 sm:px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center shadow-xs flex-1 sm:flex-initial"
                            title="Cetak Buku Jurnal Format Eksekutif (A4 Landscape Tanpa Terpotong)"
                        >
                            <i className="fas fa-print mr-1 sm:mr-1.5 text-slate-500"></i> Print
                        </button>
                        <button 
                            onClick={() => {
                                let periodLabel = 'Semua Periode Transaksi';
                                if (filterPeriod === 'THIS_MONTH') {
                                    periodLabel = `Bulan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
                                } else if (filterPeriod === 'LAST_MONTH') {
                                    const prev = new Date();
                                    prev.setMonth(prev.getMonth() - 1);
                                    periodLabel = `Bulan ${prev.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
                                } else if (filterPeriod === 'THIS_YEAR') {
                                    periodLabel = `Tahun ${new Date().getFullYear()}`;
                                } else if (filterPeriod === 'CUSTOM') {
                                    const start = customStartDate ? formatDateId(customStartDate) : 'Awal';
                                    const end = customEndDate ? formatDateId(customEndDate) : 'Sekarang';
                                    periodLabel = `${start} s.d. ${end}`;
                                }
                                ExportService.exportJournalPDF(filteredTransactions, {
                                    filename: 'Buku_Jurnal_MCC',
                                    periodText: `Periode: ${periodLabel}`,
                                    org: StorageService.getOrgProfile()
                                });
                            }}
                            className="px-2.5 sm:px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center shadow-xs flex-1 sm:flex-initial"
                            title="Unduh Buku Jurnal Format PDF Eksekutif (Presentasi & Audit)"
                        >
                            <i className="fas fa-file-pdf mr-1 sm:mr-1.5 text-rose-600"></i> PDF
                        </button>
                        <button 
                            onClick={() => ExportService.transactionsToExcel(filteredTransactions, 'Buku_Jurnal_MCC')}
                            className="px-2.5 sm:px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition flex items-center justify-center flex-1 sm:flex-initial"
                        >
                            <i className="fas fa-file-excel mr-1 sm:mr-1.5 text-emerald-600"></i> Excel
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
                            className="px-2.5 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 disabled:opacity-30 transition flex items-center justify-center" 
                            title="Batalkan aksi terakhir"
                        >
                            <i className="fas fa-undo text-slate-400"></i>
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
                            className="px-2.5 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 disabled:opacity-30 transition flex items-center justify-center" 
                            title="Ulangi aksi"
                        >
                            <i className="fas fa-redo text-slate-400"></i>
                        </button>
                    </div>
                    <button 
                        onClick={() => requireAdmin ? requireAdmin(openCreateModal) : openCreateModal()}
                        className="w-full sm:w-auto px-4 py-2 bg-[#00a884] hover:bg-[#008f70] text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center"
                    >
                        <i className="fas fa-plus mr-1.5"></i> Catat Transaksi
                    </button>
                </div>
            </div>

            {/* 3 Kartu Ringkasan Real-Time (Filtered Stats) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 no-print">
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-emerald-500 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Penerimaan Terfilter</span>
                        <p className="text-base sm:text-lg font-black text-emerald-600 font-mono-num mt-0.5 whitespace-nowrap">+{formatRupiah(sumIn)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <i className="fas fa-arrow-down text-lg"></i>
                    </div>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-rose-500 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pengeluaran Terfilter</span>
                        <p className="text-base sm:text-lg font-black text-rose-600 font-mono-num mt-0.5 whitespace-nowrap">-{formatRupiah(sumOut)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
                        <i className="fas fa-arrow-up text-lg"></i>
                    </div>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-[#00a884] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Bersih Terfilter</span>
                        <p className={`text-base sm:text-lg font-black font-mono-num mt-0.5 whitespace-nowrap ${netFiltered >= 0 ? 'text-[#00a884]' : 'text-amber-600'}`}>
                            {formatRupiah(netFiltered)}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#00a884] flex-shrink-0">
                        <i className="fas fa-wallet text-lg"></i>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar dengan Rentang Tanggal Fleksibel (Fitur 4) */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between no-print">
                <div className="w-full md:w-72 relative">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari voucher, keterangan, akun..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
                    />
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
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

                    {/* Filter Periode Fleksibel (Fitur 4) */}
                    <select 
                        value={filterPeriod} 
                        onChange={e => setFilterPeriod(e.target.value)} 
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                        <option value="ALL">Semua Periode</option>
                        <option value="THIS_MONTH">Bulan Ini</option>
                        <option value="LAST_MONTH">Bulan Lalu</option>
                        <option value="THIS_YEAR">Tahun Ini</option>
                        <option value="CUSTOM">Rentang Tanggal Kustom...</option>
                    </select>

                    {filterPeriod === 'CUSTOM' && (
                        <div className="flex items-center space-x-1.5 bg-teal-50/60 p-1.5 rounded-xl border border-teal-200/80 justify-between sm:justify-start">
                            <input 
                                type="date" 
                                value={customStartDate} 
                                onChange={e => setCustomStartDate(e.target.value)}
                                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono-num text-slate-700 focus:outline-none flex-1 sm:flex-none"
                                title="Dari Tanggal"
                            />
                            <span className="text-xs text-slate-400 font-bold px-1">s/d</span>
                            <input 
                                type="date" 
                                value={customEndDate} 
                                onChange={e => setCustomEndDate(e.target.value)}
                                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono-num text-slate-700 focus:outline-none flex-1 sm:flex-none"
                                title="Sampai Tanggal"
                            />
                            {(customStartDate || customEndDate) && (
                                <button 
                                    onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
                                    className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs font-bold"
                                    title="Reset Tanggal Kustom"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabel Jurnal Transaksi */}
            <div id="journalTableContainer" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Petunjuk Geser Layar Smartphone */}
                <div className="sm:hidden px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-between">
                    <span className="flex items-center"><i className="fas fa-arrows-left-right mr-1.5 text-[#00a884]"></i> Geser tabel ke samping untuk rincian</span>
                    <span className="text-[10px] text-slate-400 font-mono-num">{filteredTransactions.length} Transaksi</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">TANGGAL</th>
                                <th className="py-3 px-4">KETERANGAN & BUKTI</th>
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
                                filteredTransactions.map((tx) => {
                                    const isRowLocked = StorageService.isDateLocked(tx.date);

                                    return (
                                        <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="font-mono-num font-bold text-slate-700 block text-xs">{formatDateId(tx.date)}</span>
                                                    {isRowLocked && (
                                                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800" title="Periode Terkunci (Tutup Buku)">
                                                            <i className="fas fa-lock text-[8px]"></i>
                                                        </span>
                                                    )}
                                                </div>
                                                {tx.voucherNo && <span className="text-[10px] text-slate-400 font-mono-num">{tx.voucherNo}</span>}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="font-bold text-slate-900">{tx.desc}</p>
                                                {tx.receiptUrl && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setViewingReceipt(tx)}
                                                        className="inline-flex items-center space-x-1 px-2 py-0.5 mt-1 rounded-md bg-teal-50 text-[#00a884] border border-teal-200/80 text-[10px] font-bold hover:bg-teal-100 transition shadow-2xs"
                                                    >
                                                        <i className="fas fa-paperclip text-[9px]"></i>
                                                        <span>Bukti Nota</span>
                                                    </button>
                                                )}
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
                                                    {isRowLocked ? (
                                                        <span 
                                                            className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold cursor-not-allowed"
                                                            title="Transaksi ini berada dalam periode yang sudah ditutup buku"
                                                        >
                                                            <i className="fas fa-lock mr-1 text-[9px]"></i> Terkunci
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center justify-center space-x-1.5">
                                                            <button 
                                                                onClick={() => handleEdit(tx)} 
                                                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#00a884] hover:text-white text-slate-600 flex items-center justify-center transition"
                                                                title="Edit Transaksi"
                                                            >
                                                                <i className="fas fa-pencil text-[10px]"></i>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(tx.id, tx.voucherNo, tx.date, tx.desc, tx.amount)} 
                                                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 flex items-center justify-center transition"
                                                                title="Hapus Transaksi"
                                                            >
                                                                <i className="fas fa-trash text-[10px]"></i>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span>Menampilkan <strong>{filteredTransactions.length}</strong> dari <strong>{present.length}</strong> total mutasi kas</span>
                    <span className="font-mono-num text-[11px]">Sistem Keuangan ISAK 35</span>
                </div>
            </div>

            {/* Modal Formulir Transaksi Kas dengan Lampiran Bukti (Fitur 1) */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in no-print">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
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
                                    className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center text-center ${formData.type === 'Penerimaan' ? 'bg-[#00a884] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    <i className="fas fa-arrow-down mr-1 sm:mr-1.5"></i> Penerimaan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('Pengeluaran')}
                                    className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center text-center ${formData.type === 'Pengeluaran' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    <i className="fas fa-arrow-up mr-1 sm:mr-1.5"></i> Pengeluaran
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                            {/* Lampiran Bukti Kuitansi / Nota Digital (Fitur 1) */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Lampiran Bukti Transaksi (Kuitansi / Nota / Struk)
                                </label>
                                {formData.receiptUrl ? (
                                    <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center space-x-2.5 overflow-hidden">
                                            <div className="w-9 h-9 rounded-lg bg-teal-100 text-[#00a884] flex items-center justify-center flex-shrink-0">
                                                <i className={`fas ${formData.receiptUrl.startsWith('data:application/pdf') ? 'fa-file-pdf text-rose-500' : 'fa-image text-[#00a884]'}`}></i>
                                            </div>
                                            <div className="truncate">
                                                <span className="text-xs font-bold text-slate-800 block truncate">
                                                    {formData.receiptName || 'Bukti Transaksi Terlampir'}
                                                </span>
                                                <span className="text-[10px] text-teal-700 font-semibold">Siap Disimpan</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setViewingReceipt(formData)}
                                                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 transition"
                                            >
                                                Lihat
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, receiptUrl: null, receiptName: '' })}
                                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-bold transition"
                                                title="Hapus Lampiran"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-200 hover:border-[#00a884] rounded-xl p-3 flex items-center justify-center space-x-2 cursor-pointer bg-slate-50 hover:bg-teal-50/30 transition group">
                                        <i className="fas fa-paperclip text-slate-400 group-hover:text-[#00a884] transition text-sm"></i>
                                        <span className="text-xs font-semibold text-slate-600 group-hover:text-[#00a884] transition">
                                            Pilih Foto Nota / Kuitansi (JPG, PNG) atau Dokumen PDF
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files && e.target.files[0];
                                                if (file) {
                                                    compressImage(file, (dataUrl, fileName) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            receiptUrl: dataUrl,
                                                            receiptName: fileName
                                                        }));
                                                    }, (errMsg) => {
                                                        showToast({ title: 'Gagal Membaca File', message: errMsg, type: 'error' });
                                                    });
                                                }
                                            }}
                                        />
                                    </label>
                                )}
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

            {/* Modal Preview Bukti Kuitansi/Nota (Fitur 1) */}
            <ReceiptModal 
                isOpen={Boolean(viewingReceipt)}
                onClose={() => setViewingReceipt(null)}
                transaction={viewingReceipt}
            />

            {/* Modal Konfirmasi Hapus Transaksi (Sesuai Desain PIN Modal) */}
            <ConfirmModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Hapus Transaksi?"
                message={`Apakah Anda yakin ingin menghapus mutasi kas ${deleteTarget?.voucherNo || ''}? Data dapat dipulihkan melalui fitur Undo.`}
                icon="fa-trash-can"
                iconColor="rose"
                confirmText="Ya, Hapus"
                confirmVariant="danger"
            />
        </div>
    );
};

// ==========================================
// 3. LAPORAN KEUANGAN RESMI (STANDAR ISAK 35)
// ==========================================
const OfficialSignatures = () => {
    const org = StorageService.getOrgProfile();
    return (
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-start text-center text-xs text-slate-800 px-6 sm:px-8">
            <div className="w-56">
                <p className="text-slate-500 mb-0.5">Mengetahui,</p>
                <p className="font-bold text-slate-800">{org.leaderTitle || 'Direktur Eksekutif'}</p>
                <div className="h-14 flex items-center justify-center">
                    <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Cap]</span>
                </div>
                <p className="font-bold underline text-slate-800">{org.leaderName || 'Teria Salhuteru, S.Si.'}</p>
                <p className="text-[10px] text-slate-400">Yayasan Moluccas Coastal Care</p>
            </div>

            <div className="w-56">
                <p className="text-slate-500 mb-0.5">Ambon, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold text-slate-800">{org.financeTitle || 'Manajer Keuangan & Akuntansi'}</p>
                <div className="h-14 flex items-center justify-center">
                    <span className="text-[10px] text-slate-300 italic">[Tanda Tangan]</span>
                </div>
                <p className="font-bold underline text-slate-800">{org.financeName || 'Grace Manuputty, S.E.'}</p>
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
            {/* Toolbar Pemilihan Tab Laporan (Responsif & Anti-Terpotong) */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm no-print">
                {/* Mobile Dropdown Menu (100% Lebar Layar, Bebas Terpotong) */}
                <div className="sm:hidden w-full relative">
                    <select
                        value={activeReport}
                        onChange={e => setActiveReport(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 appearance-none shadow-xs"
                    >
                        {reportTabs.map(tab => (
                            <option key={tab.id} value={tab.id}>
                                {tab.title}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                        <i className="fas fa-chevron-down"></i>
                    </div>
                </div>

                {/* Desktop Menu Tabs */}
                <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
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
            </div>

            {/* Frame PDF Viewer Baku (Mengikuti Standar Rapi Boetje-Etty) */}
            <div className="rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden bg-white">
                {/* Header Toolbar Gaya Boetje-Etty */}
                <div className="p-3.5 sm:p-4 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/90 no-print">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center text-sm font-bold border border-teal-200/60 shadow-xs flex-shrink-0">
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <div>
                            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                                Preview Dokumen ISAK 35
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Baku A4
                                </span>
                            </h3>
                            <p className="text-[10px] text-slate-400">
                                Yayasan Moluccas Coastal Care • Laporan Keuangan Resmi
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-start">
                        <button 
                            onClick={() => ExportService.printReport(activeReport)} 
                            className="px-2.5 sm:px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center shadow-xs flex-1 sm:flex-initial"
                            title="Cetak Laporan Format Baku"
                        >
                            <i className="fas fa-print mr-1 sm:mr-1.5 text-slate-500"></i> Print
                        </button>
                        <button 
                            onClick={() => ExportService.exportToPdf(activeReport, `Laporan_${activeReport}_MCC`)} 
                            className="px-2.5 sm:px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center shadow-xs flex-1 sm:flex-initial"
                            title="Unduh Laporan Format PDF Eksekutif"
                        >
                            <i className="fas fa-file-pdf mr-1 sm:mr-1.5 text-rose-600"></i> PDF
                        </button>
                        <button 
                            onClick={() => ExportService.exportToExcel(activeReport, `Laporan_${activeReport}_MCC`)} 
                            className="px-2.5 sm:px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition flex items-center justify-center flex-1 sm:flex-initial border border-emerald-200 shadow-xs"
                            title="Ekspor Excel (XLSX)"
                        >
                            <i className="fas fa-file-excel mr-1 sm:mr-1.5 text-emerald-600"></i> Excel
                        </button>
                    </div>
                </div>

                {/* Canvas Workspace PDF Viewer (Gaya Boetje-Etty: Clean Slate-100, Bebas Terpotong Kiri) */}
                <div className="bg-slate-100/90 p-2 sm:p-6 md:p-8 overflow-x-auto block border-t border-slate-200/60">
                    {/* Petunjuk Geser Dokumen di Layar Smartphone */}
                    <div className="sm:hidden px-3 py-1.5 mb-2.5 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-500 font-medium flex items-center justify-between shadow-2xs">
                        <span className="flex items-center"><i className="fas fa-arrows-left-right mr-1.5 text-[#00a884]"></i> Geser dokumen ke samping untuk rincian</span>
                        <span className="text-[10px] text-slate-400 font-mono-num font-bold">A4 Baku</span>
                    </div>

                    {/* Kertas Lembar Laporan Keuangan Baku (A4 Proportions) */}
                    <div 
                        id={activeReport} 
                        className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl border border-slate-200 text-slate-900 w-[680px] sm:w-[760px] mx-auto print:w-full print:p-0 print:border-none print:shadow-none print:m-0"
                    >
                        {/* Kop Surat Entitas Nirlaba Resmi */}
                        <div className="text-center pb-2 mb-4">
                            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900">
                                {org.name || 'YAYASAN MOLUCCAS COASTAL CARE (MCC)'}
                            </h2>
                            <p className="text-xs text-slate-600 mt-0.5">
                                {org.legal || 'SK Kemenkumham RI No. AHU-0018921.AH.01.04.Tahun 2020'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {org.address || 'Jl. Christina Martha Tiahahu No. 14, Kota Ambon, Maluku – Indonesia'}
                            </p>
                            <div className="border-b border-slate-200 mt-4"></div>
                            <div className="mt-4">
                                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                                    {reportTabs.find(t => t.id === activeReport)?.title.toUpperCase()}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Periode s.d. {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (Dalam Rupiah)
                                </p>
                            </div>
                            <div className="border-b-2 border-slate-900 mt-4"></div>
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
            </div>
        </div>
    );
};

// ==========================================
// 4. MODAL PENGATURAN & TATA KELOLA KEUANGAN
// ==========================================
const SettingsModal = ({ isOpen, onClose, transactions, onDataReplaced, showToast, initialTab = 'profile' }) => {
    if (!isOpen) return null;

    const [orgProfile, setOrgProfile] = React.useState(StorageService.getOrgProfile());
    const [activeTab, setActiveTab] = React.useState(initialTab);
    const [pinForm, setPinForm] = React.useState({ oldPin: '', newPin: '', confirmPin: '' });
    const [lockedDateInput, setLockedDateInput] = React.useState(StorageService.getLockedDate());
    const [auditLogs, setAuditLogs] = React.useState(StorageService.getAuditLogs());

    React.useEffect(() => {
        if (isOpen) {
            setLockedDateInput(StorageService.getLockedDate());
            setAuditLogs(StorageService.getAuditLogs());
            if (initialTab) setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const handleSaveLock = (e) => {
        e.preventDefault();
        if (!lockedDateInput) {
            showToast({ title: 'Gagal', message: 'Tentukan tanggal tutup buku.', type: 'error' });
            return;
        }
        StorageService.setLockedDate(lockedDateInput);
        StorageService.addAuditLog({
            action: 'TUTUP BUKU',
            voucherNo: '-',
            desc: `Pembukuan dikunci sampai ${formatDateId(lockedDateInput)}`,
            amount: 0,
            details: `Transaksi pada dan sebelum tanggal ${lockedDateInput} tidak dapat diubah/dihapus.`
        });
        setAuditLogs(StorageService.getAuditLogs());
        showToast({ title: 'Tutup Buku Berhasil', message: `Seluruh transaksi sampai tanggal ${formatDateId(lockedDateInput)} berhasil dikunci.`, type: 'success' });
    };

    const handleUnlock = () => {
        StorageService.setLockedDate('');
        setLockedDateInput('');
        StorageService.addAuditLog({
            action: 'BUKA KUNCI',
            voucherNo: '-',
            desc: `Kunci periode pembukuan dibuka`,
            amount: 0,
            details: `Semua transaksi kembali dapat diedit oleh Admin.`
        });
        setAuditLogs(StorageService.getAuditLogs());
        showToast({ title: 'Kunci Dibuka', message: 'Pembatasan tutup buku telah dinonaktifkan.', type: 'info' });
    };

    const handleClearAuditLogs = () => {
        if (confirm("Bersihkan seluruh riwayat log audit perubahan?")) {
            StorageService.clearAuditLogs();
            setAuditLogs([]);
            showToast({ title: 'Log Dibersihkan', message: 'Riwayat audit telah dikosongkan.', type: 'info' });
        }
    };

    const handleExportAuditLogs = () => {
        const logs = StorageService.getAuditLogs();
        if (logs.length === 0) {
            showToast({ title: 'Log Kosong', message: 'Belum ada catatan aktivitas untuk diekspor.', type: 'info' });
            return;
        }
        let csv = "ID,Waktu,Aksi,No Voucher,Keterangan,Nominal,Detail,Pengguna\n";
        logs.forEach(l => {
            csv += `"${l.id}","${l.timestamp}","${l.action}","${l.voucherNo}","${(l.desc || '').replace(/"/g, '""')}","${l.amount}","${(l.details || '').replace(/"/g, '""')}","${l.user}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Audit_Log_MCC_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
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
            StorageService.addAuditLog({
                action: 'GANTI PIN',
                voucherNo: '-',
                desc: 'PIN Admin Keamanan Diperbarui',
                amount: 0,
                details: 'PIN otorisasi bendahara telah diubah oleh Admin.'
            });
            setAuditLogs(StorageService.getAuditLogs());
        }
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        StorageService.saveOrgProfile(orgProfile);
        showToast({ title: 'Profil Diperbarui', message: 'Data legalitas dan pejabat MCC telah disimpan.', type: 'success' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in no-print">
            <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center">
                            <i className="fas fa-sliders text-base"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800">Tata Kelola & Pengaturan</h3>
                            <p className="text-[11px] text-slate-400">Profil Yayasan, Tutup Buku, Audit Log & Keamanan PIN</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center transition">
                        <i className="fas fa-times text-xs"></i>
                    </button>
                </div>

                {/* Tab Navigasi */}
                <div className="flex space-x-2 sm:space-x-3 border-b border-slate-100 mt-4 text-xs font-bold overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'profile' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-building mr-1.5"></i> Profil MCC
                    </button>
                    <button
                        onClick={() => setActiveTab('lock')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'lock' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-lock mr-1.5 text-amber-500"></i> Tutup Buku
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'audit' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-clock-rotate-left mr-1.5 text-blue-500"></i> Riwayat Audit
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'security' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-shield-halved mr-1.5"></i> PIN Admin
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`pb-2.5 border-b-2 transition flex items-center ${activeTab === 'about' ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-circle-info mr-1.5 text-teal-600"></i> Tentang Sistem
                    </button>
                </div>

                <div className="pt-4">
                    {/* Tab 1: Profil Organisasi */}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    {/* Tab 2: Tutup Buku & Kunci Periode (Fitur 2) */}
                    {activeTab === 'lock' && (
                        <div className="space-y-4">
                            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/90 text-xs text-amber-900 flex items-start space-x-2.5">
                                <i className="fas fa-lock text-amber-600 text-base mt-0.5"></i>
                                <div>
                                    <span className="font-bold block">Integritas Laporan & Kunci Periode (Tutup Buku)</span>
                                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                                        Setelah laporan keuangan disahkan atau diaudit, Anda dapat mengunci periode transaksi. Transaksi pada atau sebelum tanggal penguncian tidak akan bisa diubah atau dihapus oleh siapapun.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveLock} className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Kunci Seluruh Transaksi Hingga Tanggal:
                                    </label>
                                    <input 
                                        type="date" 
                                        value={lockedDateInput} 
                                        onChange={e => setLockedDateInput(e.target.value)} 
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                                        required
                                    />
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">Status Penguncian Saat Ini:</span>
                                        <span className="font-bold text-slate-800">
                                            {StorageService.getLockedDate() ? (
                                                <span className="text-amber-700 flex items-center mt-0.5">
                                                    <i className="fas fa-lock mr-1.5"></i> Terkunci s/d {formatDateId(StorageService.getLockedDate())}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 mt-0.5 block">Tidak ada periode yang dikunci (Bebas Diedit)</span>
                                            )}
                                        </span>
                                    </div>
                                    {StorageService.getLockedDate() && (
                                        <button 
                                            type="button" 
                                            onClick={handleUnlock}
                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition flex items-center"
                                        >
                                            <i className="fas fa-lock-open mr-1"></i> Buka Kunci
                                        </button>
                                    )}
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button 
                                        type="submit" 
                                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center"
                                    >
                                        <i className="fas fa-check mr-1.5"></i> Simpan Tutup Buku
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab 3: Riwayat Audit (Fitur 3) */}
                    {activeTab === 'audit' && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                <div>
                                    <span className="text-xs font-bold text-slate-800 block">Log Audit Aktivitas Keuangan</span>
                                    <span className="text-[10px] text-slate-400">Mencatat mutasi, pengubahan, dan penghapusan data</span>
                                </div>
                                <div className="flex space-x-1.5">
                                    <button 
                                        type="button" 
                                        onClick={handleExportAuditLogs} 
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center"
                                    >
                                        <i className="fas fa-download mr-1 text-slate-500"></i> Ekspor CSV
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleClearAuditLogs} 
                                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-bold transition"
                                        title="Kosongkan Riwayat Log"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                                {auditLogs.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        <i className="fas fa-clock-rotate-left text-2xl mb-1 text-slate-300 block"></i>
                                        Belum ada riwayat perubahan yang tercatat.
                                    </div>
                                ) : (
                                    auditLogs.map((log) => {
                                        const badgeClass = 
                                            log.action === 'TAMBAH' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            log.action === 'UBAH' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            log.action === 'HAPUS' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            'bg-amber-50 text-amber-800 border-amber-200';
                                        
                                        return (
                                            <div key={log.id} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${badgeClass}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="font-mono-num font-bold text-slate-700 text-[11px]">
                                                            {log.voucherNo !== '-' ? log.voucherNo : log.desc}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-mono-num">
                                                        {new Date(log.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-600">{log.details || log.desc}</p>
                                                {log.amount > 0 && (
                                                    <span className="font-mono-num font-bold text-slate-800 text-[11px] block mt-1">
                                                        Nominal: {formatRupiah(log.amount)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    {/* Tab 5: Tentang Aplikasi / Creator Identity */}
                    {activeTab === 'about' && (
                        <div className="space-y-4">
                            {/* Card Identitas Pembuat */}
                            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg border border-slate-700/60 flex items-center space-x-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00a884] to-teal-400 flex items-center justify-center text-white text-lg font-black shadow-md flex-shrink-0">
                                    F
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="text-base font-black text-white tracking-tight">Forgivento</h4>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#00a884]/20 text-emerald-400 border border-[#00a884]/30 uppercase tracking-wider">
                                            Creator
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                                        This dashboard and financial management system was designed and created by <strong className="text-white">Forgivento</strong>.
                                    </p>
                                </div>
                            </div>

                            {/* Info Sistem & Spesifikasi */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <span className="font-bold text-slate-600">Application Name</span>
                                    <span className="font-black text-slate-800">OlivaFinance</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <span className="font-bold text-slate-600">Organization</span>
                                    <span className="font-medium text-slate-700">Yayasan Moluccas Coastal Care (MCC)</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <span className="font-bold text-slate-600">Accounting Standard</span>
                                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">ISAK 35 (Nonprofit Entities)</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <span className="font-bold text-slate-600">Cloud Database</span>
                                    <span className="font-semibold text-teal-700">Supabase PostgreSQL (Realtime)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-600">System Version</span>
                                    <span className="font-mono text-[11px] text-slate-500">v1.2.0 • 2026 Production</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 4b. MODAL KONFIRMASI MODERN (SESUAI DESAIN PIN MODAL)
// ==========================================
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, icon = 'fa-arrow-right-from-bracket', iconColor = 'amber', confirmText = 'Ya, Lanjutkan', confirmVariant = 'danger' }) => {
    if (!isOpen) return null;

    const colorMap = {
        amber: 'bg-amber-50 text-amber-500 ring-8 ring-amber-50/50',
        rose: 'bg-rose-50 text-rose-500 ring-8 ring-rose-50/50',
        emerald: 'bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50',
        teal: 'bg-teal-50 text-[#00a884] ring-8 ring-teal-50/50'
    };

    const btnMap = {
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20',
        primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20',
        emerald: 'bg-[#00a884] hover:bg-[#008f70] text-white shadow-md shadow-emerald-600/20'
    };

    return (
        <div className="fixed inset-0 z-[75] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in no-print">
            <div className="bg-white w-full max-w-sm rounded-[28px] p-6 sm:p-8 shadow-2xl border border-slate-100 relative transform transition-all animate-fade-in-up">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>

                <div className="flex flex-col items-center text-center mt-1">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${colorMap[iconColor] || colorMap.amber}`}>
                        <i className={`fas ${icon} text-xl`}></i>
                    </div>

                    <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-2">{title}</h3>
                    <p className="text-xs text-slate-500 mb-6 font-medium px-2 leading-relaxed">
                        {message}
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 w-full">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition text-xs active:scale-[0.98]"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`py-3 font-bold rounded-2xl transition text-xs active:scale-[0.98] ${btnMap[confirmVariant] || btnMap.danger}`}
                        >
                            {confirmText}
                        </button>
                    </div>
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

    return (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in no-print">
            <div className="bg-white w-full max-w-sm rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-slate-100 relative">
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

                    {/* 6 PIN Display Boxes */}
                    <div 
                        onClick={() => inputRef.current && inputRef.current.focus()}
                        className={`w-full relative mb-6 flex justify-center gap-1.5 sm:gap-2.5 cursor-pointer ${isError ? 'animate-shake' : ''}`}
                    >
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                            const isFilled = idx < pin.length;
                            const isCurrent = idx === pin.length && isFocused;

                            let boxStyle = "w-10 h-13 sm:w-12 sm:h-16 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center transition-all ";
                            if (isError) {
                                boxStyle += "border-rose-400 bg-rose-50/70 shadow-xs";
                            } else if (isFilled) {
                                boxStyle += "border-[#00a884] bg-white shadow-sm transform scale-[1.03]";
                            } else if (isCurrent) {
                                boxStyle += "border-[#00a884] bg-white ring-4 ring-[#00a884]/15 shadow-sm";
                            } else {
                                boxStyle += "border-slate-200 bg-slate-50/70";
                            }

                            return (
                                <div key={idx} className={boxStyle}>
                                    {isFilled ? (
                                        <div className={`w-3.5 h-3.5 rounded-full shadow-xs transition-transform transform scale-100 ${isError ? 'bg-rose-500' : 'bg-slate-800'}`}></div>
                                    ) : isCurrent ? (
                                        <div className="w-0.5 h-5 bg-[#00a884] animate-pulse rounded-full"></div>
                                    ) : null}
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

                    <button
                        type="button"
                        onClick={() => verifyInput(pin)}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold rounded-2xl transition text-xs shadow-md"
                    >
                        Verifikasi Akses
                    </button>

                    <p className="text-[10px] text-slate-400 mt-3 flex items-center justify-center">
                        <i className="fas fa-shield-alt text-slate-400 mr-1.5 text-[9px]"></i> Sesi Otorisasi Terenkripsi
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
    const [settingsInitialTab, setSettingsInitialTab] = React.useState('profile');
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

    const [isLogoutModalOpen, setLogoutModalOpen] = React.useState(false);

    const handleLogoutAdmin = () => {
        setLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        StorageService.setAdminLoggedIn(false);
        setIsAdmin(false);
        showToast({ title: 'Logout Berhasil', message: 'Anda telah keluar dari Mode Admin. Mode Hanya Lihat aktif.', type: 'info' });
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
                        <h1 className="text-sm font-black tracking-wide text-slate-800 leading-tight">OlivaFinance</h1>
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
                            &copy; {new Date().getFullYear()} Moluccas Coastal Care • ISAK 35
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
                                <h1 className="text-xs font-black tracking-wide text-slate-800 leading-tight">OlivaFinance</h1>
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
                                {view === 'dashboard' ? 'Yayasan Moluccas Coastal Care' : 
                                 view === 'journal' ? 'Buku Kas & Jurnal Mutasi Harian' : 'Pelaporan Akuntansi Entitas Nirlaba'}
                            </h2>
                        </div>
                    </div>

                    {/* Sisi Kanan: Status Admin & Pengaturan */}
                    <div className="flex items-center space-x-2">
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
                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 pb-24 md:pb-8">
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
                                onSyncRequest={(tab) => requireAdmin(() => {
                                    setSettingsInitialTab(tab || 'profile');
                                    setSettingsOpen(true);
                                })}
                                showToast={showToast}
                                isAdmin={isAdmin}
                                requireAdmin={requireAdmin}
                            />
                        )}
                        {view === 'reports' && <Reports transactions={state.present} />}
                    </div>
                    
                    {/* Footer Halaman */}
                    <footer className="mt-8 py-4 border-t border-slate-200/80 text-center text-slate-400 text-[11px] no-print flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-2">
                        <p>&copy; {new Date().getFullYear()} Yayasan Moluccas Coastal Care (MCC) • ISAK 35 Standard</p>
                        <p className="font-semibold text-slate-500">
                            OlivaFinance System • Created by <span className="font-bold text-[#00a884]">Forgivento</span>
                        </p>
                    </footer>
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
                initialTab={settingsInitialTab}
            />

            {/* Modal Konfirmasi Logout Admin (Sesuai Desain PIN Modal) */}
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="Keluar Mode Admin?"
                message="Apakah Anda yakin ingin keluar dari Mode Admin/Bendahara? Akses input dan edit data akan dikunci kembali."
                icon="fa-arrow-right-from-bracket"
                iconColor="amber"
                confirmText="Ya, Keluar"
                confirmVariant="danger"
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
