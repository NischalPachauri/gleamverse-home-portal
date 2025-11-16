type ScoreMap = Record<string, number>;

const titleKeywords: Record<string, string[]> = {
  Fantasy: ['wizard','dragon','magic','sword','kingdom','elf','witch','tolkien','narnia'],
  Romance: ['love','heart','kiss','romance','affair','wedding','valentine'],
  Mystery: ['mystery','detective','murder','crime','clue','case','sherlock'],
  Thriller: ['conspiracy','agent','code','terror','hunt','chase','assassin','secret'],
  Classic: ['dostoevsky','tolstoy','shakespeare','pride','gatsby','mockingbird','ulysses'],
  SciFi: ['galaxy','space','robot','future','alien','time machine','cyber'],
  Nonfiction: ['biography','memoir','history','science','economics','philosophy','psychology'],
  SelfHelp: ['habits','success','mindset','growth','motivation','discipline','wealth'],
  Children: ['storybook','fairy','adventure','little','young','kid','child'],
};

const authorStyles: Record<string, string[]> = {
  Classic: ['shakespeare','tolstoy','dostoevsky','austen','orwell'],
  Fantasy: ['tolkien','rowling','lewis'],
  Mystery: ['christie','conan doyle'],
  SciFi: ['asimov','clarke','gibson'],
};

const contentKeywords: Record<string, string[]> = {
  Philosophy: ['ethics','morality','virtue','existential','metaphysics','stoic','zen'],
  Business: ['market','invest','startup','management','sales','strategy'],
};

const GENRES = ['Fantasy','Romance','Mystery','Thriller','Classic','SciFi','Nonfiction','SelfHelp','Children','Philosophy','Business'] as const;
export type Genre = typeof GENRES[number];

export function classifyGenres(input: { title?: string; author?: string; description?: string; tags?: string[] }): Genre[] {
  const scores: ScoreMap = Object.fromEntries(GENRES.map(g => [g, 0]));
  const t = (input.title || '').toLowerCase();
  const a = (input.author || '').toLowerCase();
  const d = (input.description || '').toLowerCase();
  const tags = (input.tags || []).map(x => x.toLowerCase());

  for (const [genre, kws] of Object.entries(titleKeywords)) {
    for (const kw of kws) if (t.includes(kw)) scores[genre] += 3;
  }
  for (const [genre, kws] of Object.entries(authorStyles)) {
    for (const kw of kws) if (a.includes(kw)) scores[genre] += 2;
  }
  for (const [genre, kws] of Object.entries(contentKeywords)) {
    for (const kw of kws) if (d.includes(kw) || tags.includes(kw)) scores[genre] += 1;
  }

  // Normalize and select top 1-5
  const sorted = Object.entries(scores)
    .sort(([,sA],[,sB]) => sB - sA)
    .filter(([,s]) => s > 0)
    .map(([g]) => g as Genre);

  const result = sorted.slice(0, 5);
  if (result.length === 0) return ['Nonfiction'];
  return result;
}

export function genreDescription(g: Genre): string {
  switch (g) {
    case 'Fantasy':
      return 'Fantasy features imaginative worlds, magical systems, and heroic quests. Notable examples include The Lord of the Rings and A Song of Ice and Fire. Subgenres like epic fantasy, urban fantasy, and sword-and-sorcery explore mythic archetypes and modern twists. Readers enjoy the sense of wonder, rich lore, and character journeys that grapple with destiny and choice.';
    case 'Romance':
      return 'Romance centers on relationships and emotional arcs, often culminating in hopeful resolutions. Classics and contemporary hits range from Pride and Prejudice to The Kiss Quotient. Subgenres include historical, contemporary, romantic suspense, and paranormal romance. Readers are drawn to heartfelt conflict, vulnerability, and the celebration of love.';
    case 'Mystery':
      return 'Mystery builds tension around a puzzle—often a crime—unraveled through clues and deduction. Famous works include Agatha Christie’s Poirot novels and Sherlock Holmes. Subgenres span cozy mysteries, hardboiled noir, and police procedurals. Readers relish the intellectual challenge, red herrings, and satisfying revelations.';
    case 'Thriller':
      return 'Thriller delivers high stakes, accelerating danger, and constant suspense. From espionage to psychological tension, examples include The Da Vinci Code and The Girl with the Dragon Tattoo. Subgenres include spy thrillers, tech thrillers, and psychological thrillers. Readers seek adrenaline, intricate plots, and moral complexity.';
    case 'Classic':
      return 'Classics endure for artistic merit and cultural influence, from Shakespeare to Tolstoy and Austen. They illuminate human nature and social structures with memorable style and themes. Subgenres include Victorian, modernist, and postcolonial classics. Readers appreciate craftsmanship, layered meaning, and historical perspective.';
    case 'SciFi':
      return 'Science fiction explores technology, future societies, and speculative science. Touchstones include Foundation, Neuromancer, and The Left Hand of Darkness. Subgenres span hard sci‑fi, cyberpunk, and space opera. Readers value big ideas, imaginative extrapolation, and the mirror it holds to the present.';
    case 'Nonfiction':
      return 'Nonfiction conveys real-world knowledge—history, science, biography, and more. Landmarks range from Sapiens to The Immortal Life of Henrietta Lacks. Subgenres include narrative nonfiction, popular science, and biography. Readers appreciate clarity, insight, and the transformation of complex topics into engaging stories.';
    case 'SelfHelp':
      return 'Self‑help provides practical frameworks for personal growth. From Atomic Habits to The Power of Now, it blends psychology and habit design. Subgenres include productivity, mindfulness, and finance. Readers look for actionable advice, motivation, and sustainable change.';
    case 'Children':
      return 'Children’s literature balances simplicity and wonder. Beloved works span picture books to middle grade adventures like Charlotte’s Web. Subgenres include fairy tales, educational books, and fantasy adventures. Readers—young and adult alike—enjoy imaginative language, empathy, and formative themes.';
    case 'Philosophy':
      return 'Philosophy examines ethics, knowledge, and existence—from Plato to modern thinkers. Subgenres include moral philosophy, metaphysics, and epistemology. Readers appreciate rigorous argument, clarity, and ideas that challenge assumptions, often applied to everyday dilemmas.';
    case 'Business':
      return 'Business books analyze markets, leadership, and strategy—Zero to One, Good to Great, and The Lean Startup. Subgenres include entrepreneurship, management, and investing. Readers seek practical frameworks, case studies, and models that sharpen decision‑making and execution.';
  }
}