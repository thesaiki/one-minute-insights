/**
 * Data loading utilities for One Minute Insights.
 * Reads track metadata and concept JSON files from src/content/.
 */

export interface QuizOption {
  text: string;
  correct: boolean;
  explain: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export interface LessonStep {
  type: string;
  emoji: string;
  label: string | null;
  body: string;
}

export interface Resource {
  title: string;
  meta: string;
  tag: string;
}

export interface Resources {
  official: Resource[];
  free: Resource[];
  paid: Resource[];
}

export interface Concept {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  duration: string;
  category: string | null;
  steps: LessonStep[];
  quiz: QuizQuestion[];
  resources: Resources;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  desc: string;
}

export interface TrackMeta {
  id: string;
  theme: string;
  number: string;
  title: string;
  tagline: string;
  cornerEmoji: string;
  pills: string[];
  conceptOrder: string[];
  categorized: boolean;
  categories?: Category[];
}

export interface Track extends TrackMeta {
  concepts: Concept[];
}

// --- Glob imports for all track and concept JSON files ---
const trackModules = import.meta.glob<{ default: TrackMeta }>(
  '../content/tracks/*.json',
  { eager: true }
);

const conceptModules = import.meta.glob<{ default: Concept }>(
  '../content/concepts/**/*.json',
  { eager: true }
);

// Build concept map keyed by concept ID
const conceptMap: Record<string, Concept> = {};
for (const [, mod] of Object.entries(conceptModules)) {
  const concept = mod.default;
  if (concept?.id) {
    conceptMap[concept.id] = concept;
  }
}

// Build track list in order, resolving concepts
const trackMetaList: TrackMeta[] = [];
for (const [, mod] of Object.entries(trackModules)) {
  trackMetaList.push(mod.default);
}

// Sort by track number for stable ordering
trackMetaList.sort((a, b) => {
  const numA = parseInt(a.number.replace(/\D/g, ''), 10) || 0;
  const numB = parseInt(b.number.replace(/\D/g, ''), 10) || 0;
  return numA - numB;
});

function buildTrack(meta: TrackMeta): Track {
  const concepts = meta.conceptOrder
    .map(id => conceptMap[id])
    .filter((c): c is Concept => c !== undefined);

  return {
    ...meta,
    concepts,
  };
}

// Expose as a map and ordered array
export const TRACKS: Record<string, Track> = {};
export const TRACK_ORDER: string[] = [];

for (const meta of trackMetaList) {
  const track = buildTrack(meta);
  TRACKS[track.id] = track;
  TRACK_ORDER.push(track.id);
}

/**
 * Get all tracks in display order.
 */
export function getAllTracks(): Track[] {
  return TRACK_ORDER.map(id => TRACKS[id]);
}

/**
 * Get a single track by ID.
 */
export function getTrack(id: string): Track | undefined {
  return TRACKS[id];
}

/**
 * Get a single concept from a track.
 */
export function getConcept(trackId: string, conceptId: string): Concept | undefined {
  return TRACKS[trackId]?.concepts.find(c => c.id === conceptId);
}

/**
 * Get the theme mode class for body element.
 */
export function getThemeMode(theme: string): string {
  const modeMap: Record<string, string> = {
    blue: 'akamai-mode',
    amber: 'partner-mode',
    violet: 'functions-mode',
    rose: 'rose-mode',
    red: 'red-mode',
    cyan: 'cyan-mode',
    teal: 'teal-mode',
  };
  return modeMap[theme] || '';
}

/**
 * Get the theme class for track-head / next-card elements.
 */
export function getThemeClass(theme: string): string {
  const classMap: Record<string, string> = {
    blue: 'akamai-theme',
    amber: 'partner-theme',
    violet: 'functions-theme',
    rose: 'rose-theme',
    red: 'red-theme',
    cyan: 'cyan-theme',
    teal: 'teal-theme',
  };
  return classMap[theme] || '';
}

/**
 * Get the topbar label for a track theme.
 */
export function getTopbarLabel(track: Track): string {
  const labelMap: Record<string, string> = {
    amber: 'PARTNERS',
    violet: 'FUNCTIONS',
    rose: 'AI BRAND',
    red: 'MEDIA',
    cyan: 'AI / ML',
    teal: 'DEVOPS',
    blue: 'EDGE',
  };
  return labelMap[track.theme] || 'CLOUD';
}

/**
 * Get all trackId/conceptId pairs for static path generation.
 */
export function getAllConceptPaths(): { trackId: string; conceptId: string }[] {
  const paths: { trackId: string; conceptId: string }[] = [];
  for (const track of getAllTracks()) {
    for (const concept of track.concepts) {
      paths.push({ trackId: track.id, conceptId: concept.id });
    }
  }
  return paths;
}
