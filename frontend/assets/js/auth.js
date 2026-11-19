/**
 * E-Voting OSIS - Authentication Service
 */
import { request, ensureCsrf } from './api.js';

export async function login(email, password) {
  await ensureCsrf();
  return request('/login', {
    method: 'POST',
    credentials: 'include',
    body: { email, password },
  });
}

export async function logout() {
  try {
    await request('/logout', { method: 'POST', credentials: 'include' });
  } finally {
    window.location.href = '/login.html';
  }
}

export async function getCurrentUser() {
  try {
    const res = await request('/user', { credentials: 'include' });
    return res.data;
  } catch (e) {
    return null;
  }
}

/**
 * Route guard for admin pages.
 * Redirects to /login.html if unauthorized.
 */
export async function guardAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const isLoginPage = window.location.pathname.endsWith('login.html');
      if (!isLoginPage) {
        window.location.href = '/login.html';
      }
      return null;
    }
    return user;
  } catch (err) {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    if (!isLoginPage) {
      window.location.href = '/login.html';
    }
    return null;
  }
}

/**
 * Guard for login page: checks /api/user ONCE.
 * If authenticated, redirects to /hasil.html.
 * If not authenticated, stays on login.html without any redirect.
 */
export async function redirectIfAuthenticated() {
  try {
    const user = await getCurrentUser();
    if (user) {
      window.location.href = '/hasil.html';
    }
  } catch (err) {
    // Remain on login.html
  }
}
