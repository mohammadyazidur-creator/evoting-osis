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
  statTotalVotes.textContent = (data.total_votes || 0).toLocaleString('id-ID');
  statTotalCandidates.textContent = (data.candidates || []).length;

  const leader = (data.candidates || []).find(c => c.is_leader);
  if (leader && data.total_votes > 0) {
    statLeaderPaslon.textContent = `#0${leader.number} (${leader.percentage}%)`;
  } else {
    statLeaderPaslon.textContent = '-';
  }

  if (data.status === 'finished') {
    statStatusText.textContent = 'Pemilihan Ditutup';
    statStatusText.className = 'text-base sm:text-lg font-black text-[#ca8a04]';
  } else {
    statStatusText.textContent = 'Sedang Berjalan';
    statStatusText.className = 'text-base sm:text-lg font-black text-[#658d35]';
  }

  lastUpdatedText.textContent = new Date().toLocaleTimeString('id-ID') + ' WIB';

  // 2. Render Cards
  renderCards(data.candidates || [], data.total_votes || 0);

  // 3. Update Bar Chart
  if (liveBarCanvas) {
    barChartInstance = renderBarChart(liveBarCanvas.getContext('2d'), data.candidates || [], barChartInstance);
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
    const isLeader = c.is_leader && totalVotes > 0;

    const card = document.createElement('div');
    card.className = `bg-white border ${
      isLeader ? 'border-[#8dbb50] ring-2 ring-[#8dbb50]/60 shadow-[0_12px_30px_rgba(115,157,62,0.18)]' : 'border-[#e4eadc] shadow-[0_8px_24px_rgba(36,55,26,0.06)]'
    } rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl`;

    card.innerHTML = `
      <div class="relative w-full h-48 sm:h-56 bg-[#f3f6ee] overflow-hidden">
        <img
          src="${c.photo || '/assets/img/paslon1.jpg'}"
          alt="Paslon 0${c.number}"
          class="w-full h-full object-cover object-top"
          onerror="this.src='/assets/img/paslon1.jpg'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"></div>

        <!-- Leader Badge -->
        ${
          isLeader
            ? `<div class="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#fef9c3] border border-[#fde047] text-[#854d0e] font-black text-xs shadow-md flex items-center gap-1 animate-pulse">
                <span>👑</span> UNGGUL
              </div>`
            : ''
        }

        <!-- Number Tag -->
        <div class="absolute top-3 left-3 px-3 py-1 rounded-2xl bg-white/95 backdrop-blur border border-[#e4eadc] text-xl font-black text-[#789f43] shadow-sm">
          0${c.number}
        </div>

        <!-- Candidate Names -->
        <div class="absolute bottom-3 left-3 right-3">
          <div class="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur border border-[#e0e9d5] shadow-sm">
            <div class="text-xs font-black text-[#25351f] truncate">
              #0${c.number} ${c.chairman_name}
            </div>
            <div class="text-[11px] font-bold text-[#658d35] truncate">
              & ${c.vice_name}
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 space-y-3 bg-white">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#788174]">Total Suara</span>
          <span class="text-xl font-black text-[#25351f]">${c.votes_count.toLocaleString('id-ID')}</span>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span class="text-[#788174]">Persentase</span>
            <span class="text-sm font-black text-[#789f43]">${c.percentage}%</span>
          </div>
          <div class="w-full h-3 bg-[#f0f4ec] rounded-full overflow-hidden border border-[#e4eadc]">
            <div
              class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#8dbb50] to-[#a9ce70]"
              style="width: ${c.percentage}%;"
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
      <div class="text-lg font-black text-[#25351f]">HASIL IMBANG / SERI</div>
      <div class="text-sm font-extrabold text-[#789f43] leading-relaxed">${list}</div>
      <div class="text-xs font-semibold text-[#788174]">Perolehan suara: ${winner.candidates[0].votes_count} Suara</div>
    `;
  } else {
    winnerDetails.innerHTML = `
      <div class="text-xs font-extrabold uppercase tracking-wider text-[#658d35]">PASANGAN CALON TERPILIH</div>
      <div class="text-3xl font-black text-[#789f43]">NOMOR URUT 0${winner.number}</div>
      <div class="text-xl font-black text-[#25351f]">${winner.chairman_name} & ${winner.vice_name}</div>
      <div class="text-sm text-[#788174] font-semibold">${winner.chairman_class} & ${winner.vice_class}</div>
      <div class="pt-2 border-t border-[#e5ecdc] text-sm font-bold text-[#25351f]">
        Perolehan: <span class="text-[#789f43] font-black">${winner.votes_count} Suara</span> (${winner.percentage}%)
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
      liveIndicator.className = 'px-3.5 py-2 rounded-xl text-xs font-black text-[#2e6822] bg-[#eaf7e3] border border-[#cbe8be] flex items-center gap-2 shadow-sm';
      liveIndicatorText.textContent = 'LIVE';
    } else {
      liveIndicator.className = 'px-3.5 py-2 rounded-xl text-xs font-black text-red-700 bg-red-50 border border-red-200 flex items-center gap-2 shadow-sm';
      liveIndicatorText.textContent = 'Terputus...';
    }
  },
});

// Boot
requestWakeLock();
poller.start();
