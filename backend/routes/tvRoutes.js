import express from "express";
import axios from "axios";
import TvShow from "../models/TvShow.js";
import { listAllShows, getShowById } from "../controllers/tvController.js";

const tvRouter = express.Router();

const TMDB = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
});

// Get all TV shows
tvRouter.get("/shows", listAllShows);
tvRouter.get("/shows/:id", getShowById);

// Import TV shows from TMDB (like your /import/:type route)
tvRouter.post("/import/:type", async (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 32;
  const validTypes = ["popular", "top_rated", "on_the_air", "airing_today"];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid import type." });
  }

  try {
    const { data } = await TMDB.get(`/tv/${type}?language=en-US&page=1`);
    const shows = data.results.slice(0, limit);

    const detailedShows = await Promise.all(
      shows.map(async (s) => {
        try {
          const [detailRes, creditsRes] = await Promise.all([
            TMDB.get(`/tv/${s.id}?language=en-US`),
            TMDB.get(`/tv/${s.id}/credits?language=en-US`),
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
            name: detail.name,
            overview: detail.overview || "",
            poster_path: detail.poster_path
              ? `https://image.tmdb.org/t/p/w342${detail.poster_path}`
              : "",
            backdrop_path: detail.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${detail.backdrop_path}`
              : "",
            first_air_date: detail.first_air_date || "",
            original_language: detail.original_language || "en",
            tagline: detail.tagline || "",
            genres,
            casts,
            vote_average: Number(detail.vote_average || 0),
            number_of_seasons: detail.number_of_seasons || 0,
            number_of_episodes: detail.number_of_episodes || 0,
          };
        } catch (err) {
          console.log(`Failed to fetch details for show ${s.id}:`, err.message);
          return null;
        }
      })
    );

    const validShows = detailedShows.filter(Boolean);

    const ops = validShows.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true,
      },
    }));

    const result = await TvShow.bulkWrite(ops);

    res.json({
      success: true,
      imported: validShows.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default tvRouter;
