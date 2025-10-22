import express from 'express';
import Movie from '../models/Movie.js';
import TvShow from '../models/TvShow.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const q = req.query.q?.toLowerCase();
  if (!q) return res.status(400).json({ error: 'Missing search query' });

  try {
    const movieResults = await Movie.find({
      title: { $regex: q, $options: 'i' },
    }).limit(50).lean();

    const tvResults = await TvShow.find({
      name: { $regex: q, $options: 'i' },
    }).limit(50).lean();

    // Normalize and tag
    movieResults.forEach((m) => {
      m.type = 'movie';
      m.title = m.title || '';
    });

    tvResults.forEach((s) => {
      s.type = 'show';
      s.title = s.name || ''; // normalize for sorting
    });

    const combined = [...movieResults, ...tvResults];

    // 🔥 Boost score based on match quality
    const scored = combined.map((item) => {
      const title = item.title.toLowerCase();
      let score = 0;

      if (title === q) score = 100; // exact match
      else if (title.startsWith(q)) score = 80;
      else if (title.includes(q)) score = 60;
      else score = 40;

      return { ...item, _score: score };
    });

    // Sort by score DESC, then by rating DESC (optional secondary sort)
    scored.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return (b.vote_average || 0) - (a.vote_average || 0);
    });

    res.json({ results: scored });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

export default router;
