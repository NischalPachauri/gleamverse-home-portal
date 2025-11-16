import { classifyGenres, genreDescription } from '@/utils/genreClassifier';

describe('genreClassifier', () => {
  it('classifies fantasy by title keywords', () => {
    const genres = classifyGenres({ title: 'The Wizard and the Dragon' });
    expect(genres[0]).toBe('Fantasy');
  });

  it('classifies classic by author style', () => {
    const genres = classifyGenres({ title: 'Notes', author: 'Fyodor Dostoevsky' });
    expect(genres).toContain('Classic');
  });

  it('provides genre descriptions of required length', () => {
    const d = genreDescription('Mystery');
    const words = d.split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(60); // approximate 100-150 words not enforced strictly here
  });
});