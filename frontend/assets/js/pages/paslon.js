/**
 * E-Voting OSIS - Kelola Paslon (paslon.html)
 */
import { request } from '../api.js';
import { guardAdmin } from '../auth.js';
import { getCandidateColor } from '../config.js';
import { renderNavbarAdmin, showToast } from '../ui.js';

await guardAdmin();
renderNavbarAdmin('paslon');

const paslonList = document.getElementById('paslon-cards-list');

// Modal Elements
const modalEdit = document.getElementById('modal-edit-paslon');
const modalEditTitle = document.getElementById('modal-edit-title');
const btnCloseModal = document.getElementById('btn-close-edit-modal');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const formEdit = document.getElementById('form-edit-paslon');
const btnSubmitEdit = document.getElementById('btn-submit-edit');

const inputId = document.getElementById('edit-candidate-id');
const inputChairmanName = document.getElementById('edit-chairman-name');
const inputChairmanClass = document.getElementById('edit-chairman-class');
const inputViceName = document.getElementById('edit-vice-name');
const inputViceClass = document.getElementById('edit-vice-class');
const inputVision = document.getElementById('edit-vision');
const inputMission = document.getElementById('edit-mission');
const inputPhoto = document.getElementById('edit-photo');

let candidatesData = [];

async function loadCandidates() {
  try {
    const res = await request('/candidates');
    candidatesData = res.data || [];
    renderCards();
  } catch (err) {
    showToast(err.message || 'Gagal memuat data kandidat.', 'error');
  }
}

function renderCards() {
  paslonList.innerHTML = candidatesData.map(c => {
    return `
      <div class="bg-white border border-[#e4eadc] shadow-[0_8px_24px_rgba(39,57,28,0.06)] rounded-3xl overflow-hidden flex flex-col justify-between">
        <div>
          <div class="relative w-full h-56 bg-[#f4f6f3] overflow-hidden">
            <img
              src="${c.photo || '/assets/img/paslon1.jpg'}"
              alt="Paslon 0${c.number}"
              class="w-full h-full object-cover object-top"
              onerror="this.src='/assets/img/paslon1.jpg'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            <div class="absolute top-3 left-3 text-3xl font-black text-[#789f43] drop-shadow-sm">
              0${c.number}
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <div class="text-[11px] font-bold text-[#789c45] uppercase">Calon Ketua:</div>
              <div class="text-base font-black text-[#25351f]">${c.chairman_name}</div>
              <div class="text-xs text-[#658d35] font-semibold">${c.chairman_class}</div>
            </div>

            <div>
              <div class="text-[11px] font-bold text-[#789c45] uppercase">Calon Wakil:</div>
              <div class="text-base font-black text-[#25351f]">${c.vice_name}</div>
              <div class="text-xs text-[#658d35] font-semibold">${c.vice_class}</div>
            </div>

            <div class="pt-2 border-t border-[#edf0e9]">
              <div class="text-[11px] font-bold text-[#788174] uppercase">Visi:</div>
              <p class="text-xs text-[#788174] italic line-clamp-2">"${c.vision}"</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-[#f8faf6] border-t border-[#e4eadc]">
          <button
            type="button"
            class="btn-edit-candidate w-full py-2.5 px-4 rounded-xl bg-white border border-[#e1e9d8] text-[#4c603c] hover:bg-[#eaf2df] font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            data-id="${c.id}"
          >
            <span>✏️</span>
            <span>Edit Informasi & Foto</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.btn-edit-candidate').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const cand = candidatesData.find(c => c.id === id);
      if (cand) openEditModal(cand);
    });
  });
}

function openEditModal(cand) {
  inputId.value = cand.id;
  modalEditTitle.textContent = `EDIT PASLON 0${cand.number}`;
  inputChairmanName.value = cand.chairman_name;
  inputChairmanClass.value = cand.chairman_class;
  inputViceName.value = cand.vice_name;
  inputViceClass.value = cand.vice_class;
  inputVision.value = cand.vision;
  inputMission.value = cand.mission;
  inputPhoto.value = '';

  modalEdit.classList.remove('hidden');
}

function closeEditModal() {
  modalEdit.classList.add('hidden');
}

btnCloseModal?.addEventListener('click', closeEditModal);
btnCancelEdit?.addEventListener('click', closeEditModal);

formEdit?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = inputId.value;
  if (!id) return;

  const formData = new FormData();
  formData.append('_method', 'PUT');
  formData.append('chairman_name', inputChairmanName.value.trim());
  formData.append('chairman_class', inputChairmanClass.value.trim());
  formData.append('vice_name', inputViceName.value.trim());
  formData.append('vice_class', inputViceClass.value.trim());
  formData.append('vision', inputVision.value.trim());
  formData.append('mission', inputMission.value.trim());

  if (inputPhoto.files.length > 0) {
    const file = inputPhoto.files[0];
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maksimal adalah 2MB.', 'error');
      return;
    }
    formData.append('photo', file);
  }

  btnSubmitEdit.disabled = true;
  btnSubmitEdit.textContent = 'Menyimpan...';

  try {
    await request(`/candidates/${id}`, {
      method: 'POST', // POST with _method=PUT for multipart/form-data support
      body: formData,
    });
    showToast('Data paslon berhasil diperbarui!', 'success');
    closeEditModal();
    loadCandidates();
  } catch (err) {
    showToast(err.message || 'Gagal menyimpan perubahan.', 'error');
  } finally {
    btnSubmitEdit.disabled = false;
    btnSubmitEdit.textContent = 'Simpan Perubahan';
  }
});

loadCandidates();
