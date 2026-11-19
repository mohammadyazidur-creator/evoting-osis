/**
 * E-Voting OSIS - Live Quick Count (live.html)
 */
import { request } from '../api.js';
import { renderBarChart } from '../charts.js';
import { getCandidateColor } from '../config.js';
import { createPoller } from '../poller.js';
import { triggerConfetti } from '../ui.js';
import { requestWakeLock } from '../wakelock.js';

// DOM Elements
const statTotalVotes = document.getElementById('stat-total-votes');
const statTotalCandidates = document.getElementById('stat-total-candidates');
const statLeaderPaslon = document.getElementById('stat-leader-paslon');
const statStatusText = document.getElementById('stat-status-text');

const liveIndicator = document.getElementById('live-indicator');
const liveIndicatorText = document.getElementById('live-indicator-text');
const lastUpdatedText = document.getElementById('last-updated-text');

const liveCardsContainer = document.getElementById('live-cards-container');
const liveBarCanvas = document.getElementById('live-bar-chart');
const btnFullscreen = document.getElementById('btn-fullscreen');

// Winner Overlay
const winnerOverlay = document.getElementById('winner-overlay');
const winnerDetails = document.getElementById('winner-details');
const btnCloseOverlay = document.getElementById('btn-close-overlay');

let barChartInstance = null;
let hasAnnouncedWinner = false;

/**
 * Update UI with fetched results
 */
function updateUI(data) {
  // 1. Update KPI stats
  statTotalVotes.textContent = data.total_votes.toLocaleString('id-ID');
  statTotalCandidates.textContent = data.candidates.length;

  const leader = data.candidates.find(c => c.is_leader);
  if (leader && data.total_votes > 0) {
    statLeaderPaslon.textContent = `#0${leader.number} (${leader.percentage}%)`;
  } else {
    statLeaderPaslon.textContent = '-';
  }

  if (data.status === 'finished') {
    statStatusText.textContent = 'Pemilihan Ditutup';
    statStatusText.className = 'text-base sm:text-lg font-extrabold text-gold-400';
  } else {
    statStatusText.textContent = 'Sedang Berjalan';
    statStatusText.className = 'text-base sm:text-lg font-extrabold text-emerald-400';
  }

  lastUpdatedText.textContent = new Date().toLocaleTimeString('id-ID') + ' WIB';

  // 2. Render Cards
  renderCards(data.candidates, data.total_votes);

  // 3. Update Bar Chart
  if (liveBarCanvas) {
    barChartInstance = renderBarChart(liveBarCanvas.getContext('2d'), data.candidates, barChartInstance);
  }

  // 4. Handle Winner Overlay
  if (data.status === 'finished' && data.winner && !hasAnnouncedWinner) {
    hasAnnouncedWinner = true;
    showWinnerOverlay(data.winner);
  }
}

function renderCards(candidates, totalVotes) {
  liveCardsContainer.innerHTML = '';

  candidates.forEach(c => {
    const color = getCandidateColor(c.number);
    const isLeader = c.is_leader && totalVotes > 0;

    const card = document.createElement('div');
    card.className = `card overflow-hidden flex flex-col justify-between transition-all duration-300 ${isLeader ? 'border-gold-500/70 shadow-glow' : 'border-brand-500/20'
      }`;

    card.innerHTML = `
      <div class="relative w-full h-44 sm:h-52 bg-brand-950/60 overflow-hidden">
        <img
          src="${c.photo || '/assets/img/paslon1.jpg'}"
          alt="Paslon 0${c.number}"
          class="w-full h-full object-cover object-top"
          onerror="this.src='/assets/img/paslon1.jpg'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-transparent to-transparent"></div>

        <!-- Leader Crown -->
        ${isLeader
        ? `<div class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gold-500 text-brand-950 font-black text-xs shadow-lg flex items-center gap-1 animate-pulse">
                <span>👑</span> UNGGUL
              </div>`
        : ''
      }

        <!-- Number Tag -->
        <div class="absolute top-3 left-3 text-3xl font-black" style="color: ${color.primary}">
          0${c.number}
        </div>

        <div class="absolute bottom-2 left-3 right-3">
          <div class="text-sm font-black text-white truncate leading-tight">
            ${c.chairman_name}
          </div>
          <div class="text-xs text-gray-300 truncate">
            & ${c.vice_name}
          </div>
        </div>
      </div>

      <div class="p-4 space-y-3 bg-brand-950/70">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-400">Total Suara:</span>
          <span class="text-lg font-black text-white">${c.votes_count}</span>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-bold text-gray-300">Persentase</span>
            <span class="font-black text-sm" style="color: ${color.primary}">${c.percentage}%</span>
          </div>
          <div class="w-full h-2.5 bg-brand-950 rounded-full overflow-hidden border border-brand-800">
            <div
              class="h-full rounded-full transition-all duration-500"
              style="width: ${c.percentage}%; background-color: ${color.primary};"
            ></div>
          </div>
        </div>
      </div>
    `;

    liveCardsContainer.appendChild(card);
  });
}

function showWinnerOverlay(winner) {
  winnerOverlay.classList.remove('hidden');
  triggerConfetti();

  if (winner.is_tie) {
    const list = winner.candidates.map(c => `#0${c.number} ${c.chairman_name} & ${c.vice_name}`).join('<br>');
    winnerDetails.innerHTML = `
      <div class="text-lg font-bold text-white">HASIL IMBANG / SERI</div>
      <div class="text-sm text-gold-400 leading-relaxed">${list}</div>
      <div class="text-xs text-gray-300">Perolehan suara: ${winner.candidates[0].votes_count} Suara</div>
    `;
  } else {
    winnerDetails.innerHTML = `
      <div class="text-xs font-bold uppercase tracking-wider text-gold-400">PASANGAN CALON TERPILIH</div>
      <div class="text-3xl font-black text-white">NOMOR URUT 0${winner.number}</div>
      <div class="text-xl font-extrabold text-gold-400">${winner.chairman_name} & ${winner.vice_name}</div>
      <div class="text-sm text-emerald-400 font-semibold">${winner.chairman_class} & ${winner.vice_class}</div>
      <div class="pt-2 border-t border-brand-800/80 text-sm font-bold text-white">
        Perolehan: <span class="text-gold-400">${winner.votes_count} Suara</span> (${winner.percentage}%)
      </div>
    `;
  }
}

btnCloseOverlay?.addEventListener('click', () => {
  winnerOverlay.classList.add('hidden');
});

// Fullscreen & hide back button when fullscreen
btnFullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => { });
  } else {
    document.exitFullscreen().catch(() => { });
  }
});

document.addEventListener('fullscreenchange', () => {
  const btnBack = document.getElementById('btn-back-to-booth');
  if (btnBack) {
    if (document.fullscreenElement) {
      btnBack.classList.add('hidden');
    } else {
      btnBack.classList.remove('hidden');
    }
  }
});

// Setup Poller
const poller = createPoller({
  fn: async () => {
    const res = await request('/results');
    return res.data;
  },
  interval: 3000,
  onData: (data) => {
    updateUI(data);
  },
  onStatus: (isConnected) => {
    if (isConnected) {
      liveIndicator.className = 'stat-pill border-emerald-500/40 bg-emerald-950/40 text-emerald-400 text-xs font-bold';
      liveIndicatorText.textContent = 'LIVE';
    } else {
      liveIndicator.className = 'stat-pill border-red-500/40 bg-red-950/40 text-red-400 text-xs font-bold';
      liveIndicatorText.textContent = 'Terputus, mencoba lagi...';
    }
  },
});

// Boot
requestWakeLock();
poller.start();
