/**
 * TANITERANG Security & Verification Utilities
 * Hash secret tracking code using browser Web Crypto API (SHA-256)
 * Generates user-friendly Public ID and Secret Tracking Token
 */

export async function hashSecretCode(code) {
  const normalized = code.trim().toUpperCase();
  if (window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple deterministic fallback if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

export function generatePublicId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `TT-${year}-${rand}`;
}

export function generateSecretCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TR-${part1}-${part2}`;
}
