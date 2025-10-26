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

// -------------------- TV Shows (basic) --------------------
tvRouter.get("/shows", listAllShows);
tvRouter.get("/shows/:id", getShowById);

// -------------------- NEW: extras (trailer + cast) --------------------
tvRouter.get("/shows/:id/extras", async (req, res) => {
  try {
    // Your import stores _id as the TMDB id; if not found, fallback to the param.
    const paramId = req.params.id;
    const dbShow = await TvShow.findById(paramId).lean().catch(() => null);
    const tmdbId = dbShow?._id || paramId;

    // Fetch videos + credits in parallel
    const [videosRes, creditsRes] = await Promise.all([
      TMDB.get(`/tv/${tmdbId}/videos?language=en-US`),
      TMDB.get(`/tv/${tmdbId}/credits?language=en-US`),
    ]);

    // --- Pick best trailer (prefer Official YouTube Trailer)
    const vids = Array.isArray(videosRes?.data?.results)
      ? videosRes.data.results
      : [];
    const bestVideo =
      vids.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
      vids.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
      vids.find((v) => v.site === "YouTube");
    const trailerUrl = bestVideo ? `https://www.youtube.com/watch?v=${bestVideo.key}` : null;

    // --- Map cast to your UI shape (first 12; you can slice fewer in the UI)
    const castRaw = Array.isArray(creditsRes?.data?.cast) ? creditsRes.data.cast : [];
    const cast = castRaw.slice(0, 12).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      img: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : "https://via.placeholder.com/185x278?text=No+Image",
    }));

    res.json({ trailerUrl, cast });
  } catch (error) {
    console.error("TV extras error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Failed to load extras" });
  }
});

// -------------------- Import from TMDB --------------------
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
            _type: "tv",
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

// GET /api/tv/shows/:id/cast  -> full cast list
tvRouter.get("/shows/:id/cast", async (req, res) => {
  try {
    const paramId = req.params.id;
    const dbShow = await TvShow.findById(paramId).lean().catch(() => null);
    const tmdbId = dbShow?._id || paramId;

    const { data } = await TMDB.get(`/tv/${tmdbId}/credits?language=en-US`);
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
    console.error("TV full cast error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Failed to load cast" });
  }
});

// -------------------- Danger: Delete all TV shows --------------------
tvRouter.delete("/delete-all", async (req, res) => {
  try {
    const result = await TvShow.deleteMany({});
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default tvRouter;
