/**
 * E-Voting OSIS - Login Page (login.html)
 */
import { login, redirectIfAuthenticated } from '../auth.js';

const formLogin = document.getElementById('form-login');
const inputEmail = document.getElementById('input-email');
const inputPassword = document.getElementById('input-password');
const btnSubmit = document.getElementById('btn-submit-login');
const errorAlert = document.getElementById('login-error-alert');
const errorMsg = document.getElementById('login-error-msg');

redirectIfAuthenticated();

formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorAlert.classList.add('hidden');

  const email = inputEmail.value.trim();
  const password = inputPassword.value;

  if (!email || !password) return;

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Memverifikasi...';

  try {
    await login(email, password);
    window.location.href = '/hasil.html';
  } catch (err) {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Masuk ke Panel';
    errorMsg.textContent = err.message || 'Login gagal. Periksa email dan password.';
    errorAlert.classList.remove('hidden');
  }
});
