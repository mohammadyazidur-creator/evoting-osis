/**
 * E-Voting OSIS - Grafik Utama Admin (hasil.html)
 */
import { request } from '../api.js';
import { guardAdmin } from '../auth.js';
import { renderBarChart } from '../charts.js';
import { getCandidateColor } from '../config.js';
import { exportToExcel } from '../export.js';
import { createPoller } from '../poller.js';
import { confirmDialog, renderNavbarAdmin, showToast, triggerConfetti } from '../ui.js';

// DOM Elements
const statTotalVotes = document.getElementById('stat-total-votes');
const statVotingStatus = document.getElementById('stat-voting-status');
const lastUpdated = document.getElementById('last-updated');

const btnFinish = document.getElementById('btn-finish-voting');
const btnReopen = document.getElementById('btn-reopen-voting');
const btnExport = document.getElementById('btn-export-excel');
const btnReset = document.getElementById('btn-reset-votes');
const btnFullscreen = document.getElementById('btn-fullscreen');

const chartCanvas = document.getElementById('main-bar-chart');
const chartLegend = document.getElementById('chart-legend');

// Reset modal
const modalReset = document.getElementById('modal-reset');
const formReset = document.getElementById('form-reset');
const inputAdminPassword = document.getElementById('input-admin-password');
const btnCancelReset = document.getElementById('btn-cancel-reset');

let chartInstance = null;
let currentElectionData = null;

// Guard Admin
await guardAdmin();
renderNavbarAdmin('hasil');

function updateUI(data) {
  currentElectionData = data;

  statTotalVotes.textContent = (data.total_votes || 0).toLocaleString('id-ID');

  if (data.status === 'finished') {
    statVotingStatus.textContent = 'Pemilihan Ditutup';
    statVotingStatus.className = 'text-sm sm:text-base font-extrabold text-gold-400';
    btnFinish.classList.add('hidden');
    btnReopen.classList.remove('hidden');
  } else {
    statVotingStatus.textContent = 'Sedang Berjalan';
    statVotingStatus.className = 'text-sm sm:text-base font-extrabold text-emerald-400';
    btnFinish.classList.remove('hidden');
    btnReopen.classList.add('hidden');
  }

  lastUpdated.textContent = new Date().toLocaleTimeString('id-ID') + ' WIB';

  // Render Bar Chart
  if (chartCanvas) {
    chartInstance = renderBarChart(chartCanvas.getContext('2d'), data.candidates, chartInstance);
  }

  // Update Legend
  if (chartLegend) {
    chartLegend.innerHTML = data.candidates.map(c => {
      const color = getCandidateColor(c.number);
      return `
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full" style="background-color: ${color.primary}"></span>
          <span class="font-bold text-gray-300">0${c.number}:</span>
          <span class="font-extrabold text-white">${c.votes_count} (${c.percentage}%)</span>
        </div>
      `;
    }).join('');
  }
}

// Action: Finish / Announce Winner
btnFinish?.addEventListener('click', () => {
  confirmDialog({
    title: 'Umumkan Pemenang & Tutup Voting?',
    message: 'Tindakan ini akan mengunci bilik suara (murid tidak bisa mencoblos lagi) dan menampilkan perayaan pemenang di layar TV.',
    confirmText: 'Ya, Umumkan Sekarang',
    confirmClass: 'btn-primary',
    onConfirm: async () => {
      try {
        const res = await request('/election/finish', { method: 'POST' });
        showToast('Pemenang berhasil diumumkan! Voting ditutup.', 'success');
        triggerConfetti();
        updateUI(res.data);
      } catch (err) {
        showToast(err.message || 'Gagal menutup voting.', 'error');
      }
    },
  });
});

// Action: Reopen Voting
btnReopen?.addEventListener('click', () => {
  confirmDialog({
    title: 'Buka Kembali Voting?',
    message: 'Bilik suara murid akan kembali aktif dan murid dapat melanjutkan pemilihan suara.',
    confirmText: 'Ya, Buka Kembali',
    confirmClass: 'btn-secondary',
    onConfirm: async () => {
      try {
        const res = await request('/election/reopen', { method: 'POST' });
        showToast('Voting berhasil dibuka kembali!', 'success');
        updateUI(res.data);
      } catch (err) {
        showToast(err.message || 'Gagal membuka kembali voting.', 'error');
      }
    },
  });
});

// Action: Export Excel
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
    btnExport.innerHTML = '<span>📥</span><span>Ekspor Excel</span>';
  }
});

// Action: Reset Votes (Modal with password confirmation)
btnReset?.addEventListener('click', () => {
  inputAdminPassword.value = '';
  modalReset.classList.remove('hidden');
  inputAdminPassword.focus();
});

btnCancelReset?.addEventListener('click', () => {
  modalReset.classList.add('hidden');
});

formReset?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = inputAdminPassword.value;
  if (!password) return;

  try {
    const res = await request('/election/reset', {
      method: 'POST',
      body: { password },
    });
    modalReset.classList.add('hidden');
    showToast('Semua suara berhasil di-reset ke 0.', 'success');
    updateUI(res.data);
  } catch (err) {
    showToast(err.message || 'Password salah. Reset dibatalkan.', 'error');
  }
});

// Fullscreen
btnFullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => { });
  } else {
    document.exitFullscreen().catch(() => { });
  }
});

// Polling every 5 seconds
const poller = createPoller({
  fn: async () => {
    const res = await request('/results');
    return res.data;
  },
  interval: 5000,
  onData: (data) => updateUI(data),
});

poller.start();
