/**
 * E-Voting OSIS - Tabel Rekapitulasi (tabel.html)
 */
import { request } from '../api.js';
import { guardAdmin } from '../auth.js';
import { getCandidateColor } from '../config.js';
import { exportToExcel } from '../export.js';
import { createPoller } from '../poller.js';
import { renderNavbarAdmin, showToast } from '../ui.js';

await guardAdmin();
renderNavbarAdmin('tabel');

const tableBody = document.getElementById('table-candidates-body');
const tfootTotalVotes = document.getElementById('tfoot-total-votes');
const btnExport = document.getElementById('btn-export-excel');

let currentElectionData = null;

function renderTable(data) {
  currentElectionData = data;
  tfootTotalVotes.textContent = (data.total_votes || 0).toLocaleString('id-ID');

  tableBody.innerHTML = (data.candidates || []).map(c => {
    const color = getCandidateColor(c.number);
    const isLeader = c.is_leader && data.total_votes > 0;

    return `
      <tr class="hover:bg-[#f8faf6] transition-colors">
        <td class="text-center font-black text-lg text-[#789f43]">
          0${c.number}
        </td>
        <td class="text-center py-2">
          <img
            src="${c.photo || '/assets/img/paslon1.jpg'}"
            alt="Paslon 0${c.number}"
            class="w-12 h-14 object-cover object-top rounded-xl border border-[#e4eadc] mx-auto shadow-sm"
            onerror="this.src='/assets/img/paslon1.jpg'"
          />
        </td>
        <td class="font-black text-[#25351f]">
          #0${c.number} ${c.chairman_name} & ${c.vice_name}
        </td>
        <td>
          <div class="font-bold text-[#25351f]">${c.chairman_name}</div>
          <div class="text-xs text-[#658d35] font-semibold">${c.chairman_class}</div>
        </td>
        <td>
          <div class="font-bold text-[#25351f]">${c.vice_name}</div>
          <div class="text-xs text-[#658d35] font-semibold">${c.vice_class}</div>
        </td>
        <td class="text-right font-black text-base text-[#25351f]">
          ${c.votes_count.toLocaleString('id-ID')}
        </td>
        <td>
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-[#788174]">${c.votes_count} suara</span>
              <span class="text-[#789f43] font-black">${c.percentage}%</span>
            </div>
            <div class="w-full h-2.5 bg-[#f0f4ec] rounded-full overflow-hidden border border-[#e4eadc]">
              <div
                class="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#8dbb50] to-[#a9ce70]"
                style="width: ${c.percentage}%"
              ></div>
            </div>
          </div>
        </td>
        <td class="text-center">
          ${isLeader
        ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-[#fef9c3] border border-[#fde047] text-[#854d0e] animate-pulse">👑 UNGGUL</span>`
        : `<span class="text-xs text-[#94a3b8] font-semibold">-</span>`
      }
        </td>
      </tr>
    `;
  }).join('');
}

btnExport?.addEventListener('click', async () => {
  if (!currentElectionData) return;
  try {
    btnExport.disabled = true;
    btnExport.textContent = 'Mengekspor...';
    await exportToExcel(currentElectionData);
    showToast('File Excel rekapitulasi berhasil diunduh!', 'success');
  } catch (err) {
    showToast(err.message || 'Gagal ekspor Excel.', 'error');
  } finally {
    btnExport.disabled = false;
    btnExport.innerHTML = '<span>📥</span><span>Unduh Excel</span>';
  }
});

const poller = createPoller({
  fn: async () => {
    const res = await request('/results');
    return res.data;
  },
  interval: 5000,
  onData: renderTable,
});

poller.start();
