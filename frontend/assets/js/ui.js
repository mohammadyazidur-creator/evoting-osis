/**
 * E-Voting OSIS - Reusable UI Components & Helpers
 */
import { logout } from './auth.js';
import { getCandidateColor } from './config.js';

export function renderNavbarAdmin(activePage = 'hasil') {
  const navContainer = document.getElementById('admin-navbar');
  if (!navContainer) return;

  const links = [
    { id: 'hasil', label: 'Grafik', url: '/hasil.html', icon: '📊' },
    { id: 'tabel', label: 'Tabel', url: '/tabel.html', icon: '📋' },
    { id: 'persentase', label: 'Persentase', url: '/persentase.html', icon: '🍩' },
    { id: 'riwayat', label: 'Riwayat', url: '/riwayat.html', icon: '⏱️' },
    { id: 'paslon', label: 'Paslon', url: '/paslon.html', icon: '👥' },
    { id: 'bilik', label: 'Bilik Suara', url: '/', icon: '🗳️' },
  ];

  const linksHtml = links.map(link => {
    const isActive = link.id === activePage;
    const activeClass = 'px-3.5 py-2 rounded-xl text-xs font-black text-[#203018] bg-[#eaf2df] border border-[#dce9cc] flex items-center gap-1.5 shadow-sm';
    const normalClass = 'px-3.5 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:text-[#25351f] hover:bg-[#f4f7f0] transition-all flex items-center gap-1.5';
    return `
      <a href="${link.url}" class="${isActive ? activeClass : normalClass}">
        <span>${link.icon}</span>
        <span>${link.label}</span>
      </a>
    `;
  }).join('');

  navContainer.innerHTML = `
    <header class="border-b border-[#e8ede4] bg-white/95 backdrop-blur sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border border-[#edf0e9] shadow-sm">
            <img src="/assets/img/logo-smk.webp" alt="Logo SMK" class="w-full h-full object-contain" />
          </div>
          <div>
            <h1 class="font-black text-sm sm:text-base leading-tight text-[#25351f] tracking-wide">
              PANEL ADMIN <span class="text-[#658d35]">E-VOTING</span>
            </h1>
            <p class="text-[11px] text-[#788174] leading-none font-semibold">SMK Mamba'ul Ihsan</p>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-1">
          ${linksHtml}
        </nav>

        <div class="flex items-center gap-2.5">
          <!-- Tombol Layar Live Tetap di Samping Logout Saja -->
          <a href="/live.html" target="_blank" class="btn bg-gradient-to-r from-[#8dbb50] to-[#a9ce70] hover:from-[#7ea844] hover:to-[#99bd61] text-[#203018] !py-2 !px-3.5 text-xs font-black flex items-center gap-2 rounded-xl shadow-sm transition-all" title="Buka Layar Live di Tab Baru untuk Proyektor/TV">
            <span class="w-2 h-2 rounded-full bg-[#203018] animate-pulse"></span>
            <span class="tracking-wider">Layar Live ↗</span>
          </a>
          <button id="btn-logout" class="btn bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 rounded-xl cursor-pointer transition-colors">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <!-- Mobile Submenu -->
      <div class="md:hidden flex items-center gap-1 px-4 py-2 border-t border-[#e8ede4] overflow-x-auto bg-[#f8faf6]">
        ${linksHtml}
      </div>
    </header>
  `;

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    confirmDialog({
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin logout dari panel admin?',
      confirmText: 'Ya, Keluar',
      confirmClass: 'btn-danger',
      onConfirm: () => logout(),
    });
  });
}

/**
 * Render single candidate voting card for bilik suara (index.html)
 */
export function renderCandidateCard(c, isExpanded, onToggle, onSelect) {
  const card = document.createElement('div');
  card.className = 'relative flex-shrink-0 w-[290px] sm:w-[330px] md:w-[360px] rounded-3xl overflow-hidden bg-white border border-[#e4eadc] shadow-[0_10px_28px_rgba(39,57,28,0.10)] transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(39,57,28,0.14)]';

  card.innerHTML = `
    <!-- Top Bar: Nomor Urut & Badge -->
    <div class="p-4 pb-2 flex items-center justify-between z-10 relative">
      <span class="text-4xl sm:text-5xl font-black tracking-tight text-[#789f43]">
        0${c.number}
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#f6faef] border border-[#dce9cb] text-[#5c8033]">
        PASLON OSIS
      </span>
    </div>

    <!-- Candidate Photo Container -->
    <div class="relative w-full h-[360px] sm:h-[400px] overflow-hidden bg-[#f4f6f3] px-3 pt-1">
      <img
        src="${c.photo || '/assets/img/paslon1.jpg'}"
        alt="Paslon 0${c.number}"
        class="w-full h-full object-cover object-top rounded-2xl transition-transform duration-500 hover:scale-105"
        onerror="this.src='/assets/img/paslon1.jpg'"
      />
      
      <!-- Gradient overlay at bottom of photo -->
      <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>

      <!-- Sliding Detail Drawer Overlay -->
      <div class="drawer-panel absolute inset-0 bg-white/95 backdrop-blur-md p-5 flex flex-col justify-between transition-all duration-300 transform ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}">
        <div class="space-y-3 overflow-y-auto pr-1 text-left">
          <div class="p-2.5 bg-[#f7f9f4] border border-[#e6ecdf] rounded-xl">
            <div class="text-[10px] font-bold uppercase tracking-wider text-[#789c45]">Calon Ketua:</div>
            <div class="text-sm sm:text-base font-extrabold text-[#273321] leading-tight">${c.chairman_name}</div>
            <div class="text-xs font-semibold text-[#85907c]">${c.chairman_class}</div>
          </div>

          <div class="p-2.5 bg-[#f7f9f4] border border-[#e6ecdf] rounded-xl">
            <div class="text-[10px] font-bold uppercase tracking-wider text-[#789c45]">Calon Wakil Ketua:</div>
            <div class="text-sm sm:text-base font-extrabold text-[#273321] leading-tight">${c.vice_name}</div>
            <div class="text-xs font-semibold text-[#85907c]">${c.vice_class}</div>
          </div>

          <div class="p-2.5 bg-[#f7f9f4] border border-[#e6ecdf] rounded-xl">
            <div class="text-[10px] font-bold uppercase tracking-wider text-[#789c45]">Visi:</div>
            <p class="text-xs text-[#788472] italic leading-relaxed">"${c.vision}"</p>
          </div>

          <div class="p-2.5 bg-[#f7f9f4] border border-[#e6ecdf] rounded-xl">
            <div class="text-[10px] font-bold uppercase tracking-wider text-[#789c45]">Misi:</div>
            <p class="text-xs text-[#788472] whitespace-pre-line leading-relaxed">${c.mission}</p>
          </div>
        </div>

        <div class="pt-2 border-t border-[#e6ecdf]">
          <p class="text-[10px] text-[#85907c] text-center font-semibold">Tekan tombol panah di kanan untuk menutup</p>
        </div>
      </div>

      <!-- Single Toggle Arrow Button (Satu per kartu) -->
      <button
        type="button"
        class="btn-toggle-drawer absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-[#eaf2df] border border-[#dce9cc] text-[#648b38] flex items-center justify-center shadow-md transition-transform active:scale-90 hover:bg-[#dce9cc] cursor-pointer"
        aria-label="Toggle Detail Paslon"
      >
        <span class="text-lg font-black transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}">
          ${isExpanded ? '❮' : '❯'}
        </span>
      </button>

      <!-- Candidate Names Pill (Bottom of photo) -->
      <div class="absolute bottom-3 left-4 right-16 z-10">
        <div class="px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur border border-[#e0e9d5] shadow-sm">
          <div class="text-xs font-extrabold text-[#25351f] truncate">
            #0${c.number} ${c.chairman_name} & ${c.vice_name}
          </div>
        </div>
      </div>
    </div>

    <!-- Candidate Bottom Info & Vote Button -->
    <div class="p-4 pt-3 flex flex-col gap-3 z-10 bg-white">
      <button
        type="button"
        class="btn-select-candidate w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8dbb50] to-[#a9ce70] hover:from-[#7ea844] hover:to-[#99bd61] text-[#203018] font-black text-sm tracking-wider shadow-[0_4px_14px_rgba(115,157,62,0.25)] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
      >
        <span>PILIH</span>
        <span>✓</span>
      </button>
    </div>
  `;

  // Attach event listeners
  const btnToggle = card.querySelector('.btn-toggle-drawer');
  btnToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    onToggle();
  });

  const btnSelect = card.querySelector('.btn-select-candidate');
  btnSelect.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect(c);
  });

  return card;
}

/**
 * Toast Notification
 */
export function showToast(message, type = 'info') {
  const containerId = 'toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass =
    type === 'success' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200' :
    type === 'error' ? 'bg-red-950 border-red-500/50 text-red-200' :
    'bg-brand-900 border-gold-500/40 text-gold-200';

  toast.className = `px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-semibold flex items-center gap-2.5 transition-all duration-300 pointer-events-auto transform translate-y-4 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Reusable Confirmation Dialog
 */
export function confirmDialog({
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  confirmClass = 'btn-primary',
  onConfirm,
  onCancel,
}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content animate-in fade-in zoom-in duration-200">
      <h3 class="text-xl font-extrabold text-white mb-2">${title}</h3>
      <p class="text-sm text-gray-300 mb-6 leading-relaxed">${message}</p>
      <div class="flex items-center justify-end gap-3">
        <button type="button" class="btn-cancel btn-secondary !py-2.5 !px-4 text-sm">${cancelText}</button>
        <button type="button" class="btn-confirm ${confirmClass} !py-2.5 !px-5 text-sm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const cleanup = () => {
    overlay.remove();
  };

  overlay.querySelector('.btn-cancel').addEventListener('click', () => {
    cleanup();
    if (onCancel) onCancel();
  });

  overlay.querySelector('.btn-confirm').addEventListener('click', () => {
    cleanup();
    if (onConfirm) onConfirm();
  });
}

/**
 * Trigger local confetti
 */
export function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}
