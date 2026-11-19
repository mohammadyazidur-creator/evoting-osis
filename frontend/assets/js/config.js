/**
 * E-Voting OSIS - Configuration
 * Single source of configuration for frontend
 */
export const API_BASE_URL = '/api';

export const CANDIDATE_COLORS = {
  1: {
    primary: '#f59e0b',
    border: '#d97706',
    bg: 'rgba(245, 158, 11, 0.2)',
    name: 'Emas (Paslon 01)',
  },
  2: {
    primary: '#10b981',
    border: '#059669',
    bg: 'rgba(16, 185, 129, 0.2)',
    name: 'Hijau (Paslon 02)',
  },
  3: {
    primary: '#3b82f6',
    border: '#2563eb',
    bg: 'rgba(59, 130, 246, 0.2)',
    name: 'Biru (Paslon 03)',
  },
};

export function getCandidateColor(num) {
  return CANDIDATE_COLORS[num] || {
    primary: '#9ca3af',
    border: '#6b7280',
    bg: 'rgba(156, 163, 175, 0.2)',
  };
}
