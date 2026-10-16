export const catalog = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    year: 2008,
    genres: ['Animation', 'Comedy', 'Family'],
    duration: 596,
    description: 'A giant rabbit sets out to teach a trio of bullies that kindness can be stronger than cruelty.',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    videoUrl: '/videos/big-buck-bunny.mp4',
    accent: '#9c7bf7',
    sourceUrl: 'https://peach.blender.org/download/'
  },
  {
    id: 'sintel',
    title: 'Sintel',
    year: 2010,
    genres: ['Animation', 'Adventure', 'Fantasy'],
    duration: 888,
    description: 'A lone wanderer searches a fantasy world for the dragon she raised as a companion.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=85',
    videoUrl: '/videos/sintel.mp4',
    accent: '#f08d6c',
    sourceUrl: 'https://durian.blender.org/download/'
  },
  {
    id: 'elephants-dream',
    title: "Elephants Dream",
    year: 2006,
    genres: ['Animation', 'Sci-Fi', 'Surreal'],
    duration: 653,
    description: 'Two characters travel through a strange, surreal machine-world where nothing is quite as it seems.',
    poster: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85',
    videoUrl: '/videos/elephants-dream.mp4',
    accent: '#b2a0ff',
    sourceUrl: 'https://orange.blender.org/download/'
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    year: 2012,
    genres: ['Sci-Fi', 'Action', 'Drama'],
    duration: 734,
    description: 'A group of warriors and scientists confront a threat to humanity in a futuristic Amsterdam.',
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=85',
    videoUrl: '/videos/tears-of-steel.mp4',
    accent: '#6dbbc8',
    sourceUrl: 'https://mango.blender.org/download/'
  },
  {
    id: 'spring',
    title: 'Spring',
    year: 2019,
    genres: ['Animation', 'Fantasy', 'Adventure'],
    duration: 464,
    description: 'A shepherd girl and her dog face ancient spirits to continue the cycle of life.',
    poster: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85',
    videoUrl: '/videos/spring.mp4',
    accent: '#84c69a',
    sourceUrl: 'https://studio.blender.org/projects/spring/'
  },
  {
    id: 'sprite-fright',
    title: 'Sprite Fright',
    year: 2021,
    genres: ['Animation', 'Horror', 'Comedy'],
    duration: 630,
    description: 'A group of teenagers on a forest trip discover mushroom creatures with a surprising way of defending their home.',
    poster: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=85',
    videoUrl: '/videos/sprite-fright.mp4',
    accent: '#ffb86c',
    sourceUrl: 'https://studio.blender.org/projects/sprite-fright/'
  },
  {
    id: 'charge',
    title: 'Charge',
    year: 2022,
    genres: ['Animation', 'Sci-Fi', 'Action'],
    duration: 215,
    description: 'In an energy-scarce dystopia, an old man breaks into a battery factory and faces a deadly security droid.',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=85',
    videoUrl: '/videos/charge.mp4',
    accent: '#ff7e73',
    sourceUrl: 'https://studio.blender.org/projects/charge/'
  },
  {
    id: 'cosmos-laundromat',
    title: 'Cosmos Laundromat: First Cycle',
    year: 2015,
    genres: ['Animation', 'Fantasy', 'Comedy'],
    duration: 730,
    description: 'A suicidal sheep meets a peculiar salesman who offers him the chance to experience new lives.',
    poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=85',
    videoUrl: '/videos/cosmos-laundromat.mp4',
    accent: '#76a8ff',
    sourceUrl: 'https://studio.blender.org/projects/cosmos-laundromat/'
  }
];

export const genres = [...new Set(catalog.flatMap((movie) => movie.genres))].sort();

function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = old;
    }
  }
  return row[b.length];
}

export function searchMovies({ q = '', genre = 'All', sort = 'recommended' } = {}) {
  const query = q.trim().toLowerCase();
  let results = catalog.map((movie) => {
    const title = movie.title.toLowerCase();
    const words = `${title} ${movie.genres.join(' ').toLowerCase()} ${movie.description.toLowerCase()}`;
    const titleWords = title.split(/\s+/);
    const queryWords = query.split(/\s+/).filter(Boolean);
    const fuzzyMatches = queryWords.map((part) => Math.min(...titleWords.map((word) => levenshtein(part, word))));
    const fuzzyScore = fuzzyMatches.every((distance) => distance <= 2) ? 40 - fuzzyMatches.reduce((sum, distance) => sum + distance, 0) * 4 : 0;
    const score = !query ? 1 : (title.includes(query) ? 100 : words.includes(query) ? 60 : fuzzyScore);
    return { ...movie, searchScore: score };
  }).filter((movie) => movie.searchScore > 0 && (genre === 'All' || movie.genres.includes(genre)));
  if (sort === 'newest') results.sort((a, b) => b.year - a.year);
  else if (sort === 'oldest') results.sort((a, b) => a.year - b.year);
  else results.sort((a, b) => b.searchScore - a.searchScore || b.year - a.year);
  return results;
}

export function recommendations(currentId, limit = 4) {
  const current = catalog.find((movie) => movie.id === currentId);
  return catalog.filter((movie) => movie.id !== currentId).map((movie) => ({
    ...movie,
    similarity: current ? movie.genres.filter((genre) => current.genres.includes(genre)).length : 0
  })).sort((a, b) => b.similarity - a.similarity || b.year - a.year).slice(0, limit);
}
