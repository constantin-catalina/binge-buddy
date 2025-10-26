import express from 'express';
import axios from 'axios';
import { getMovies, listAllMovies, getMovieById } from '../controllers/movieController.js';
import { protectAdmin } from '../middleware/auth.js';
import Movie from '../models/Movie.js';
import { tmdbFindMovieIdByTitleYear, tmdbMovieVideos, tmdbMovieCredits } from "../services/tmdb.js";

const showRouter = express.Router();

// DB-backed movie listing and detail
showRouter.get('/movies', listAllMovies);        // GET /api/show/movies
showRouter.get('/movies/:id', getMovieById);     // GET /api/show/movies/:id

const TMDB = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
});

showRouter.post('/import/:type', async (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || null; // Optional ?limit=32
  const validTypes = ['popular', 'top_rated', 'now_playing', 'upcoming'];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid import type.' });
  }

  try {
    let page = 1;
    const allMovies = [];

    while (true) {
      const { data } = await TMDB.get(`/movie/${type}?language=en-US&page=${page}`);
      const { results, total_pages } = data;

      if (!results || results.length === 0) break;

      allMovies.push(...results);

      if (limit && allMovies.length >= limit) {
        allMovies.length = limit; // Truncate to exact limit
        break;
      }

      page++;
      if (page > total_pages || page > 500) break;
    }

    const detailedMovies = await Promise.all(
      allMovies.map(async (m) => {
        try {
          const [detailRes, creditsRes] = await Promise.all([
            TMDB.get(`/movie/${m.id}?language=en-US`),
            TMDB.get(`/movie/${m.id}/credits?language=en-US`),
          ]);

          const detail = detailRes.data;
          const credits = creditsRes.data;

          const casts = (credits.cast || []).slice(0, 10).map((c) => c.name);
          const genres = (detail.genres || []).map((g) => ({
            id: g.id,
            name: g.name,
          }));

          return {
            _id: String(detail.id),
            _type: 'movie',
            title: detail.title,
            overview: detail.overview || '',
            poster_path: detail.poster_path
              ? `https://image.tmdb.org/t/p/w342${detail.poster_path}`
              : '',
            backdrop_path: detail.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${detail.backdrop_path}`
              : '',
            release_date: detail.release_date || '',
            original_language: detail.original_language || 'en',
            tagline: detail.tagline || '',
            genres,
            casts,
            vote_average: Number(detail.vote_average || 0),
            runtime: detail.runtime || 0,
          };
        } catch (err) {
          console.log(`Failed to fetch details for movie ${m.id}:`, err.message);
          return null;
        }
      })
    );

    const validMovies = detailedMovies.filter(Boolean);

    const ops = validMovies.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true,
      },
    }));

    const result = await Movie.bulkWrite(ops);
    res.json({
      success: true,
      type,
      limit: limit || 'all',
      pagesFetched: page - 1,
      imported: validMovies.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete all movies
showRouter.delete('/delete-all', async (req, res) => {
  try {
    const result = await Movie.deleteMany({});
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/show/movies/:id/extras
 * Returns { trailerUrl, cast: [{id, name, character, profile}] }
 */
showRouter.get("/movies/:id/extras", async (req, res) => {
  try {
    const dbMovie = await Movie.findById(req.params.id).lean();
    if (!dbMovie) return res.status(404).json({ message: "Movie not found" });

    const title = dbMovie.title || dbMovie.name || "";
    const year = (dbMovie.release_date || "").slice(0, 4);

    // If you store tmdbId in your schema, prefer using that directly.
    const tmdbId = dbMovie.tmdbId || (await tmdbFindMovieIdByTitleYear(title, year));
    if (!tmdbId) return res.json({ trailerUrl: null, cast: [] });

    const [trailerUrl, cast] = await Promise.all([
      tmdbMovieVideos(tmdbId),
      tmdbMovieCredits(tmdbId),
    ]);

    res.json({ trailerUrl, cast });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load extras" });
  }
});

// ✅ FULL CAST (MOVIES)
showRouter.get("/movies/:id/cast", async (req, res) => {
  try {
    const paramId = req.params.id;
    const dbMovie = await Movie.findById(paramId).lean().catch(() => null);
    const tmdbId = dbMovie?._id || paramId;

    const { data } = await TMDB.get(`/movie/${tmdbId}/credits?language=en-US`);
    const castRaw = Array.isArray(data?.cast) ? data.cast : [];

    const cast = castRaw.map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      img: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : "https://via.placeholder.com/185x278?text=No+Image",
    }));

    res.json({ cast });
  } catch (error) {
    console.error("Movie full cast error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Failed to load cast" });
  }
});

export default showRouter;
