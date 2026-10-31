/**
 * Olivafinance - Moluccas Coastal Care (MCC)
 * Modul Ekspor Laporan: PDF, Word (.doc), Excel (.xlsx), dan Cetak
 */

const ExportService = {
    // Ekspor elemen DOM ke format PDF A4
    toPDF: (elementId, filename = "Laporan_Keuangan_MCC") => {
        const element = document.getElementById(elementId);
        if (!element) {
            alert("Elemen laporan tidak ditemukan.");
            return;
        }

        const noPrintElements = element.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.style.display = 'none');

        // Indikator loading sementara
        const originalCursor = document.body.style.cursor;
        document.body.style.cursor = 'wait';

        if (window.html2canvas && window.jspdf) {
            window.html2canvas(element, { 
                scale: 2, 
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                // Tambahkan gambar ke halaman PDF
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${filename}.pdf`);

                noPrintElements.forEach(el => el.style.display = '');
                document.body.style.cursor = originalCursor;
            }).catch(err => {
                console.error("Gagal membuat PDF:", err);
                noPrintElements.forEach(el => el.style.display = '');
                document.body.style.cursor = originalCursor;
                alert("Terjadi kesalahan saat memproses PDF.");
            });
        } else {
            document.body.style.cursor = originalCursor;
            window.print();
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
                    body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; }
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
    },

    // Ekspor tabel DOM ke Microsoft Excel (.xlsx)
    toExcel: (tableId, filename = "Laporan_Keuangan_MCC") => {
        const element = document.getElementById(tableId);
        if (!element) return;

        if (window.XLSX) {
            const wb = window.XLSX.utils.table_to_book(element, { sheet: "Laporan MCC" });
            window.XLSX.writeFile(wb, `${filename}.xlsx`);
        } else {
            alert("Pustaka SheetJS belum dimuat.");
        }
    },

    // Ekspor daftar transaksi langsung ke file Excel
    transactionsToExcel: (transactions, filename = "Jurnal_Transaksi_MCC") => {
        if (!window.XLSX) return;

        const rows = transactions.map((t, idx) => ({
            "No": idx + 1,
            "Tanggal": t.date,
            "Deskripsi / Keterangan": t.desc,
            "Jenis Aliran": t.type,
            "Kategori Akun (ISAK 35)": t.category,
            "Pembatasan Dana": t.restriction,
            "Nominal (Rp)": t.amount
        }));

        const ws = window.XLSX.utils.json_to_sheet(rows);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Jurnal Harian");
        window.XLSX.writeFile(wb, `${filename}.xlsx`);
    },

    exportToPdf: (id, name) => ExportService.toPDF(id, name),
    exportToWord: (id, name) => ExportService.toWord(id, name),
    exportToExcel: (id, name) => ExportService.toExcel(id, name),
    printReport: (id) => { window.print(); }
};

// Pastikan tersedia di scope window / browser global
if (typeof window !== 'undefined') {
    window.ExportService = ExportService;
}
