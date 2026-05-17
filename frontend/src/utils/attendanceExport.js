import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, formatTime } from './formatters';

const mapRows = (rows) =>
  rows.map((item) => ({
    Tanggal: formatDate(item.timeIn),
    Nama: item.user?.name || '-',
    Email: item.user?.email || '-',
    Direktorat: item.user?.direktorat?.name || '-',
    Divisi: item.user?.divisi?.name || '-',
    Masuk: formatTime(item.timeIn),
    Pulang: formatTime(item.timeOut),
    Status: item.status,
    Validasi: item.isValid ? 'Valid' : 'Tidak Valid',
  }));

export const exportAttendanceToExcel = (rows) => {
  const worksheet = XLSX.utils.json_to_sheet(mapRows(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi');
  XLSX.writeFile(workbook, 'komdigi-attendance.xlsx');
};

export const exportAttendanceToPdf = (rows) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('Riwayat Absensi Komdigi', 14, 16);

  autoTable(doc, {
    startY: 24,
    head: [[
      'Tanggal',
      'Nama',
      'Email',
      'Direktorat',
      'Divisi',
      'Masuk',
      'Pulang',
      'Status',
      'Validasi',
    ]],
    body: mapRows(rows).map((item) => Object.values(item)),
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
  });

  doc.save('komdigi-attendance.pdf');
};
