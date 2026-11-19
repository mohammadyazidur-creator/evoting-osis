/**
 * E-Voting OSIS - Bilik Suara Client (index.html)
 */
import { request } from '../api.js';
import { renderCandidateCard, showToast, triggerConfetti } from '../ui.js';
import { requestWakeLock } from '../wakelock.js';

// Elements
const sectionHero = document.getElementById('section-hero');
const sectionCatalog = document.getElementById('section-catalog');
const sectionSuccess = document.getElementById('section-success');
const sectionClosed = document.getElementById('section-closed');
const sectionError = document.getElementById('section-error');
const errorMessageText = document.getElementById('error-message-text');

const candidatesContainer = document.getElementById('candidates-container');
const btnStartVote = document.getElementById('btn-start-vote');
const btnBackHero = document.getElementById('btn-back-hero');
const btnRetryLoad = document.getElementById('btn-retry-load');
const btnCheckAgain = document.getElementById('btn-check-again');

// Modal Elements
const modalConfirm = document.getElementById('modal-confirm-vote');
const modalPaslonNumber = document.getElementById('modal-paslon-number');
const modalPaslonNames = document.getElementById('modal-paslon-names');
const modalPaslonClasses = document.getElementById('modal-paslon-classes');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const btnModalConfirm = document.getElementById('btn-modal-confirm');

const countdownElement = document.getElementById('countdown-timer');
const successVoterInfo = document.getElementById('success-voter-info');

// In-Memory State (NO localStorage)
let state = {
  candidates: [],
  votingOpen: true,
  expandedCandidateId: null,
  selectedCandidate: null,
  isSubmitting: false,
};

function showSection(section) {
  [sectionHero, sectionCatalog, sectionSuccess, sectionClosed, sectionError].forEach(s => {
    s.classList.add('hidden');
    s.classList.remove('flex');
  });
  section.classList.remove('hidden');
  section.classList.add('flex');
}

/**
 * Fetch latest election state from server
 */
async function loadElectionState() {
  try {
    const res = await request('/state');
    const data = res.data;

    state.candidates = data.candidates || [];
    state.votingOpen = data.voting_open && data.status !== 'finished';

    if (!state.votingOpen) {
      showSection(sectionClosed);
      return;
    }

    renderCandidates();
  } catch (err) {
    errorMessageText.textContent = err.message || 'Gagal terhubung ke server.';
    showSection(sectionError);
  }
}

/**
 * Render candidate cards into container
 */
function renderCandidates() {
  candidatesContainer.innerHTML = '';
  state.candidates.forEach(cand => {
    const isExpanded = state.expandedCandidateId === cand.id;
    const cardEl = renderCandidateCard(
      cand,
      isExpanded,
      () => {
        // Toggle single drawer
        state.expandedCandidateId = state.expandedCandidateId === cand.id ? null : cand.id;
        renderCandidates();
      },
      (selected) => {
        openConfirmModal(selected);
      }
    );
    candidatesContainer.appendChild(cardEl);
  });
}

function openConfirmModal(candidate) {
  state.selectedCandidate = candidate;
  modalPaslonNumber.textContent = `NOMOR URUT 0${candidate.number}`;
  modalPaslonNames.textContent = `${candidate.chairman_name} & ${candidate.vice_name}`;
  modalPaslonClasses.textContent = `${candidate.chairman_class} & ${candidate.vice_class}`;

  btnModalConfirm.disabled = false;
  btnModalConfirm.textContent = 'YA, SAYA YAKIN';

  modalConfirm.classList.remove('hidden');
}

function closeConfirmModal() {
  modalConfirm.classList.add('hidden');
  state.selectedCandidate = null;
  state.isSubmitting = false;
}

/**
 * Submit vote to backend
 */
async function submitVote() {
  if (!state.selectedCandidate || state.isSubmitting) return;

  state.isSubmitting = true;
  btnModalConfirm.disabled = true;
  btnModalConfirm.textContent = 'Menyimpan...';

  // In-memory UUID prevents duplicate submissions
  const requestId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('vote-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9));

  try {
    const res = await request('/votes', {
      method: 'POST',
      body: {
        candidate_id: state.selectedCandidate.id,
        request_id: requestId,
      },
    });

    closeConfirmModal();

    // Show Success Screen
    showSuccessScreen(res.data);
  } catch (err) {
    btnModalConfirm.disabled = false;
    btnModalConfirm.textContent = 'YA, SAYA YAKIN';
    state.isSubmitting = false;
    showToast(err.message || 'Gagal menyimpan suara. Silakan coba lagi.', 'error');
  }
}

function showSuccessScreen(voteData) {
  showSection(sectionSuccess);
  triggerConfetti();

  successVoterInfo.innerHTML = `
    <div class="text-xs font-bold text-gray-400">Identitas Suara:</div>
    <div class="text-base font-extrabold text-gold-400">Pemilih #${voteData.voter_number || '-'}</div>
    <div class="text-[11px] text-gray-400 mt-1">Waktu: ${new Date().toLocaleTimeString('id-ID')} WIB</div>
  `;

  let count = 5;
  countdownElement.textContent = count;

  const timer = setInterval(() => {
    count--;
    countdownElement.textContent = count;
    if (count <= 0) {
      clearInterval(timer);
      resetToHero();
    }
  }, 1000);
}

function resetToHero() {
  state.expandedCandidateId = null;
  state.selectedCandidate = null;
  state.isSubmitting = false;
  showSection(sectionHero);
}

// Event Listeners
btnStartVote?.addEventListener('click', async () => {
  await requestWakeLock();
  await loadElectionState();
  if (state.votingOpen) {
    showSection(sectionCatalog);
  }
});

btnBackHero?.addEventListener('click', () => {
  showSection(sectionHero);
});

btnRetryLoad?.addEventListener('click', () => {
  showSection(sectionHero);
  loadElectionState();
});

btnCheckAgain?.addEventListener('click', () => {
  loadElectionState();
});

btnModalCancel?.addEventListener('click', () => {
  closeConfirmModal();
});

btnModalConfirm?.addEventListener('click', () => {
  submitVote();
});

// Initial boot
requestWakeLock();
showSection(sectionHero);
loadElectionState();
