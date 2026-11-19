/**
 * E-Voting OSIS - Riwayat Pemilih (riwayat.html)
 */
import { request } from '../api.js';
import { guardAdmin } from '../auth.js';
import { getCandidateColor } from '../config.js';
import { renderNavbarAdmin, showToast } from '../ui.js';

await guardAdmin();
renderNavbarAdmin('riwayat');

const tableBody = document.getElementById('history-table-body');
const paginationInfo = document.getElementById('pagination-info');
const paginationPages = document.getElementById('pagination-pages');
const btnPrev = document.getElementById('btn-prev-page');
const btnNext = document.getElementById('btn-next-page');
const btnRefresh = document.getElementById('btn-refresh-history');

let currentPage = 1;
let lastPage = 1;
const perPage = 20;

async function loadHistory(page = 1) {
  try {
    const res = await request(`/votes/history?page=${page}&per_page=${perPage}`);
    const data = res.data;

    currentPage = data.current_page;
    lastPage = data.last_page || 1;

    renderTable(data.items, (currentPage - 1) * perPage);
    updatePagination(data);
  } catch (err) {
    showToast(err.message || 'Gagal memuat log riwayat pemilih.', 'error');
  }
}

function renderTable(items, offset) {
  if (!items || items.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-12 text-center text-gray-500 font-semibold text-sm">
          Belum ada riwayat suara yang tercatat.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = items.map((v, i) => {
    const cand = v.candidate;
    const color = cand ? getCandidateColor(cand.number) : { primary: '#9ca3af' };

    return `
      <tr class="hover:bg-brand-800/30 transition-colors">
        <td class="text-center font-bold text-gray-400 text-xs">
          ${offset + i + 1}
        </td>
        <td class="font-bold text-white">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-800 text-gold-400 text-xs border border-brand-500/20">
            👤 ${v.voter_label}
          </span>
        </td>
        <td class="font-extrabold text-sm">
          ${cand
        ? `<span style="color: ${color.primary}">#0${cand.number}</span> - ${cand.chairman_name} & ${cand.vice_name}`
        : '<span class="text-gray-500">-</span>'
      }
        </td>
        <td class="text-xs text-gray-400 font-mono">
          ${v.ip_address || '-'}
        </td>
        <td class="text-xs text-gray-300 font-medium">
          ${v.voted_at_formatted || '-'}
        </td>
      </tr>
    `;
  }).join('');
}

function updatePagination(data) {
  const from = data.total > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const to = Math.min(currentPage * perPage, data.total);

  paginationInfo.textContent = `Menampilkan ${from} - ${to} dari ${data.total} suara`;
  paginationPages.textContent = `Hal ${currentPage} dari ${lastPage}`;

  btnPrev.disabled = currentPage <= 1;
  btnNext.disabled = currentPage >= lastPage;
}

btnPrev?.addEventListener('click', () => {
  if (currentPage > 1) loadHistory(currentPage - 1);
});

btnNext?.addEventListener('click', () => {
  if (currentPage < lastPage) loadHistory(currentPage + 1);
});

btnRefresh?.addEventListener('click', () => {
  loadHistory(currentPage);
  showToast('Data riwayat disegarkan.', 'info');
});

loadHistory(1);
