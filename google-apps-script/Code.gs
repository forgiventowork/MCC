/**
 * Olivafinance - Moluccas Coastal Care (MCC)
 * Google Apps Script Backend (Code.gs)
 * 
 * Panduan Penggunaan:
 * 1. Buat Google Spreadsheet baru di Google Drive Anda.
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus seluruh isi default, lalu salin (paste) kode di bawah ini.
 * 4. Klik tombol 'Deploy' (Terapkan) > 'New deployment' (Penerapan baru).
 * 5. Pilih type: 'Web app' (Aplikasi web).
 * 6. Setel 'Execute as': 'Me' (Saya) dan 'Who has access': 'Anyone' (Siapa saja).
 * 7. Salin URL Web App yang dihasilkan, lalu masukkan ke dalam Pengaturan Cloud di aplikasi Olivafinance MCC.
 */

const SHEET_NAME = "Database_MCC";

// Headers standar pada Google Sheets
const HEADERS = ["ID", "Tanggal", "Deskripsi", "Jenis", "Kategori", "Pembatasan", "Nominal"];

/**
 * Mengambil atau membuat sheet database secara otomatis
 */
function getDatabaseSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setBackground("#312e81")
         .setFontColor("#ffffff")
         .setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Handle HTTP GET Request (Mendukung Web Interface & REST API JSON)
 */
function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : null;

  // Jika dipanggil via REST API / Fetch
  if (action === "getAllTransactions") {
    const transactions = getAllTransactions();
    return ContentService.createTextOutput(JSON.stringify(transactions))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Jika dibuka langsung via browser, sajikan tampilan HTML
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Olivafinance - Moluccas Coastal Care (ISAK 35)')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Handle HTTP POST Request (Mendukung Operasi Tambah, Edit, Hapus, dan Batch Sync)
 */
function doPost(e) {
  let responseData = { success: false, message: "Aksi tidak dikenali." };

  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    const action = body.action;

    if (action === "addTransaction") {
      const result = addTransaction(body.payload || body);
      responseData = { success: true, data: result };
    } else if (action === "editTransaction") {
      const result = editTransaction(body.payload || body);
      responseData = { success: true, data: result };
    } else if (action === "deleteTransaction") {
      const result = deleteTransaction(body.id || (body.payload && body.payload.id));
      responseData = { success: true, data: result };
    } else if (action === "syncBatchTransactions") {
      const result = syncBatchTransactions(body.transactions || []);
      responseData = { success: true, count: result };
    } else if (action === "getAllTransactions") {
      responseData = { success: true, data: getAllTransactions() };
    }
  } catch (err) {
    responseData = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Membaca semua transaksi dari Google Sheets
 */
function getAllTransactions() {
  const sheet = getDatabaseSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return data.map(row => {
    let dateStr = row[1];
    if (dateStr instanceof Date) {
      dateStr = Utilities.formatDate(dateStr, Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
    return {
      id: String(row[0]),
      date: String(dateStr),
      desc: String(row[2]),
      type: String(row[3]),
      category: String(row[4]),
      restriction: String(row[5]),
      amount: parseFloat(row[6]) || 0
    };
  });
}

/**
 * Menambahkan transaksi baru ke Google Sheets
 */
function addTransaction(tx) {
  const sheet = getDatabaseSheet();
  const newRow = [
    tx.id || ("tx-" + Date.now()),
    tx.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    tx.desc || "",
    tx.type || "Penerimaan",
    tx.category || "",
    tx.restriction || "Tanpa Pembatasan",
    parseFloat(tx.amount) || 0
  ];
  sheet.appendRow(newRow);
  return tx;
}

/**
 * Mengedit transaksi yang ada di Google Sheets berdasarkan ID
 */
function editTransaction(tx) {
  const sheet = getDatabaseSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(tx.id)) {
      const rowIndex = i + 2;
      sheet.getRange(rowIndex, 2, 1, 6).setValues([[
        tx.date,
        tx.desc,
        tx.type,
        tx.category,
        tx.restriction,
        parseFloat(tx.amount) || 0
      ]]);
      return true;
    }
  }
  return false;
}

/**
 * Menghapus transaksi dari Google Sheets berdasarkan ID
 */
function deleteTransaction(id) {
  const sheet = getDatabaseSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

/**
 * Sinkronisasi batch seluruh transaksi dari aplikasi lokal ke Google Sheets
 */
function syncBatchTransactions(transactions) {
  if (!Array.isArray(transactions)) return 0;
  const sheet = getDatabaseSheet();
  
  // Kosongkan data lama (kecuali header baris 1)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
  }

  if (transactions.length === 0) return 0;

  const rows = transactions.map(tx => [
    tx.id || ("tx-" + Date.now()),
    tx.date || "",
    tx.desc || "",
    tx.type || "",
    tx.category || "",
    tx.restriction || "",
    parseFloat(tx.amount) || 0
  ]);

  sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  return rows.length;
}
