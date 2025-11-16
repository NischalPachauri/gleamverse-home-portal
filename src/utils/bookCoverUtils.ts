
import { bookCoverMapping } from './bookCoverMapping';

const normalize = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

const getAcronym = (str: string) =>
  str
    .split(' ')
    .map(word => word[0])
    .join('');

// Precompute tokens to avoid repeated splitting in hot paths
const jaccardSimilarity = (aTokens: Set<string>, bTokens: Set<string>) => {
  const intersection = new Set([...aTokens].filter(token => bTokens.has(token)));
  const unionSize = aTokens.size + bTokens.size - intersection.size;
  return unionSize ? intersection.size / unionSize : 0;
};

type PreprocessedEntry = { key: string; normalized: string; acronym: string; tokens: Set<string>; cover: string };
const preprocessed: PreprocessedEntry[] = Object.entries(bookCoverMapping).map(([key, cover]) => {
  const normalized = normalize(key);
  const tokens = new Set(normalized.split(' ').filter(Boolean));
  const acronym = getAcronym(normalized);
  return { key, normalized, tokens, acronym, cover };
});
const exactMap = new Map(preprocessed.map(e => [e.normalized, e.cover]));

export const findBestMatch = (title: string) => {
  const normalizedTitle = normalize(title);
  const titleTokens = new Set(normalizedTitle.split(' ').filter(Boolean));
  const titleAcronym = getAcronym(normalizedTitle);

  let bestMatch = { score: 0, cover: '' };

  // Prefer exact match first to avoid acronym collisions
  const exact = exactMap.get(normalizedTitle);
  if (exact) return exact;

  for (const entry of preprocessed) {

    // Exact match
    // Exact matched above using map

    // Acronym match
    if (titleAcronym.length > 1 && titleAcronym === entry.acronym) {
      bestMatch = { score: 1, cover: entry.cover };
      continue;
    }

    // Jaccard similarity
    const score = jaccardSimilarity(titleTokens, entry.tokens);
    if (score > bestMatch.score) {
      bestMatch = { score, cover: entry.cover };
    }
  }

  return bestMatch.score > 0.5 ? bestMatch.cover : null;
};
