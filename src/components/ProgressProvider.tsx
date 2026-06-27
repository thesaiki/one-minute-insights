/**
 * ProgressProvider — Preact context for reading/writing localStorage progress.
 * Key: linodestick:progress
 * Structure: { [trackId]: { [conceptId]: { score: string, completed: boolean } } }
 */

const STORAGE_KEY = 'linodestick:progress';

interface ConceptProgress {
  score: string;
  completed: boolean;
}

type ProgressData = Record<string, Record<string, ConceptProgress>>;

function readProgress(): ProgressData {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function getProgress(): ProgressData {
  return readProgress();
}

export function markComplete(trackId: string, conceptId: string, score: string): void {
  const progress = readProgress();
  if (!progress[trackId]) progress[trackId] = {};
  progress[trackId][conceptId] = { score, completed: true };
  writeProgress(progress);
}

export function isCompleted(trackId: string, conceptId: string): boolean {
  const progress = readProgress();
  return progress[trackId]?.[conceptId]?.completed === true;
}

export function getTrackCompleted(trackId: string): number {
  const progress = readProgress();
  return Object.keys(progress[trackId] || {}).length;
}

export function getTrackPercent(trackId: string, totalConcepts: number): number {
  if (totalConcepts === 0) return 0;
  return Math.round((getTrackCompleted(trackId) / totalConcepts) * 100);
}

export function getTotalCompleted(): number {
  const progress = readProgress();
  let total = 0;
  for (const trackId of Object.keys(progress)) {
    total += Object.keys(progress[trackId]).length;
  }
  return total;
}
