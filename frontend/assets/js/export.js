/**
 * E-Voting OSIS - Excel Export Service
 * Exports 2 sheets: Rekapitulasi Suara & Data Pemilih using local SheetJS
 */
import { request } from './api.js';

export async function exportToExcel(electionData) {
  if (!window.XLSX) {
    throw new Error('Library SheetJS (xlsx.full.min.js) belum termuat.');
  }

  // 1. Fetch full voter transactions
  const votesRes = await request('/votes/history?per_page=10000');
  const votes = votesRes.data.items || [];

  // Sheet 1: Rekapitulasi Suara
  const rekapData = [
    ['REKAPITULASI HASIL SUARA PEMILIHAN KETUA & WAKIL KETUA OSIS'],
    ['SMK MAMBA\'UL IHSAN BANYUURIP UJUNGPANGKAH GRESIK'],
    ['Masa Bakti: 2026/2027'],
    ['Total Suara Masuk: ' + (electionData.total_votes || 0)],
    ['Status: ' + (electionData.voting_open ? 'Sedang Berlangsung' : 'Selesai / Ditutup')],
    [],
    ['No. Urut', 'Pasangan Calon', 'Calon Ketua', 'Kelas', 'Calon Wakil', 'Kelas', 'Perolehan Suara', 'Persentase (%)'],
  ];

  (electionData.candidates || []).forEach(c => {
    rekapData.push([
      `#0${c.number}`,
      `#0${c.number} ${c.chairman_name} & ${c.vice_name}`,
      c.chairman_name,
      c.chairman_class,
      c.vice_name,
      c.vice_class,
      c.votes_count,
      `${c.percentage}%`,
    ]);
  });

  // Sheet 2: Data Log Pemilih
  const logData = [
    ['LOG TRANSAKSI PEMILIHAN (LUBER & JURDIL)'],
    ['SMK MAMBA\'UL IHSAN BANYUURIP UJUNGPANGKAH GRESIK'],
    ['Catatan: Identitas pemilih bersifat anonim'],
    [],
    ['No', 'Identitas Pemilih', 'Pilihan Paslon', 'Waktu Voting (WIB)', 'Alamat IP'],
  ];

  votes.forEach((v, index) => {
    logData.push([
      index + 1,
      v.voter_label,
      v.candidate ? `#0${v.candidate.number} - ${v.candidate.chairman_name} & ${v.candidate.vice_name}` : 'N/A',
      v.voted_at_formatted || v.voted_at,
      v.ip_address || '-',
    ]);
  });

  // Build Workbook
  const wb = window.XLSX.utils.book_new();

  const wsRekap = window.XLSX.utils.aoa_to_sheet(rekapData);
  const wsLog = window.XLSX.utils.aoa_to_sheet(logData);

  // Column widths
  wsRekap['!cols'] = [
    { wch: 10 },
    { wch: 35 },
    { wch: 22 },
    { wch: 12 },
    { wch: 22 },
    { wch: 12 },
    { wch: 18 },
    { wch: 15 },
  ];

  wsLog['!cols'] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 40 },
    { wch: 22 },
    { wch: 18 },
  ];

  window.XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi Suara');
  window.XLSX.utils.book_append_sheet(wb, wsLog, 'Data Pemilih');

  const filename = `Rekapitulasi_EVoting_OSIS_${new Date().toISOString().slice(0, 10)}.xlsx`;
  window.XLSX.writeFile(wb, filename);
}
