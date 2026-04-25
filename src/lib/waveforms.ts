/**
 * V3 frame format: 16 hex chars per 100ms frame.
 * - bytes 0..3: frequency (4 bytes, all equal)
 * - bytes 4..7: intensity (4 bytes, all equal, 0..100)
 */

export interface ParsedFrame {
  freq: number;
  intPct: number;
}

export function parseV3Hex(hex: string): ParsedFrame {
  if (!hex || hex.length < 16) return { freq: 10, intPct: 0 };
  const freq = parseInt(hex.slice(0, 2), 16);
  const intPct = parseInt(hex.slice(14, 16), 16);
  return {
    freq: Number.isNaN(freq) ? 10 : freq,
    intPct: Number.isNaN(intPct) ? 0 : intPct,
  };
}

export function getIntensityFromHex(hex: string): number {
  if (!hex || hex.length < 16) return 0;
  return parseInt(hex.slice(14, 16), 16) || 0;
}

export function buildV3Hex(freq: number, intPct: number): string {
  const f = Math.max(0, Math.min(255, Math.round(freq)));
  const i = Math.max(0, Math.min(255, Math.round(intPct)));
  const fHex = f.toString(16).padStart(2, "0").toUpperCase();
  const iHex = i.toString(16).padStart(2, "0").toUpperCase();
  return fHex + fHex + fHex + fHex + iHex + iHex + iHex + iHex;
}

export function clampInt(v: number, min: number, max: number): number {
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
}
