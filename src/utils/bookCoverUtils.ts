
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

const jaccardSimilarity = (a: string, b: string) => {
  const aTokens = new Set(a.split(' '));
  const bTokens = new Set(b.split(' '));
  const intersection = new Set([...aTokens].filter(token => bTokens.has(token)));
  const union = new Set([...aTokens, ...bTokens]);
  return intersection.size / union.size;
};

export const findBestMatch = (title: string) => {
  const normalizedTitle = normalize(title);
  const titleAcronym = getAcronym(normalizedTitle);

  let bestMatch = { score: 0, cover: '' };

  for (const [key, cover] of Object.entries(bookCoverMapping)) {
    const normalizedKey = normalize(key);
    const keyAcronym = getAcronym(normalizedKey);

    // Exact match
    if (normalizedTitle === normalizedKey) {
      return cover;
    }

    // Acronym match
    if (titleAcronym.length > 1 && titleAcronym === keyAcronym) {
      return cover;
    }

    // Jaccard similarity
    const score = jaccardSimilarity(normalizedTitle, normalizedKey);
    if (score > bestMatch.score) {
      bestMatch = { score, cover };
    }
  }

  return bestMatch.score > 0.5 ? bestMatch.cover : null;
};
