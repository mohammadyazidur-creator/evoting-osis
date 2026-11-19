/**
 * E-Voting OSIS - Centralized API Service
 * Handles requests with selective credentials:
 * - Public routes (/state, /results, /candidates, /votes): credentials: 'omit' (ZERO cookies)
 * - Admin routes: credentials: 'include', reads XSRF-TOKEN for mutations
 */
import { API_BASE_URL } from './config.js';

let csrfTokenPromise = null;

/**
 * Fetch CSRF cookie once before admin login
 */
export async function ensureCsrf() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    }).catch(() => {
      csrfTokenPromise = null;
    });
  }
  return csrfTokenPromise;
}

/**
 * Read XSRF-TOKEN from document.cookie (READ-ONLY, for admin mutations only)
 */
function getXsrfToken() {
  const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Determine if endpoint is a public route (no session, no cookies)
 */
function isPublicEndpoint(endpoint) {
  const clean = endpoint.replace(/^\/api/, '').replace(/^\//, '').split('?')[0];
  return clean === 'state' || clean === 'results' || clean === 'candidates' || clean === 'votes';
}

/**
 * Main request helper
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const isPublic = isPublicEndpoint(endpoint);

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  // If sending JSON body, set Content-Type
  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  // Credentials policy: omit for public routes, include for admin
  const credentials = options.credentials || (isPublic ? 'omit' : 'include');

  // Attach XSRF token ONLY for admin mutations (POST/PUT/DELETE)
  const method = (options.method || 'GET').toUpperCase();
  if (!isPublic && method !== 'GET' && method !== 'HEAD') {
    const xsrfToken = getXsrfToken();
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken;
    }
  }

  const fetchOptions = {
    ...options,
    method,
    headers,
    credentials,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // 401 Unauthorized handling: redirect to login.html only once if not already there
    if (response.status === 401) {
      const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname === '/login.html';
      const isLoginRequest = url.endsWith('/login');

      if (!isLoginPage && !isLoginRequest) {
        window.location.href = '/login.html';
      }
      throw new Error('Sesi telah berakhir atau belum login.');
    }

    const contentType = response.headers.get('content-type') || '';
    let result = null;
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { success: response.ok, message: text };
    }

    if (!response.ok) {
      const errorMsg = result?.message || result?.error || `Terjadi kesalahan (Kode: ${response.status})`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = result;
      throw err;
    }

    return result;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      error.message = 'Koneksi ke server terputus. Pastikan server aktif dan terhubung ke jaringan.';
    }
    throw error;
  }
}
