import express from "express";
import { requireAuth } from "@clerk/express";
import PlayLog from "../models/PlayLog.js";
import ProgressItem from "../models/ProgressItem.js";

const router = express.Router();
router.use(requireAuth());

/**
 * GET /api/stats/month?year=2025&month=9
 * month is 1..12; defaults to current month
 */
router.get("/month", async (req, res) => {
  const userId = req.auth.userId;

  const now = new Date();
  const y = Number(req.query.year || now.getFullYear());
  const m = Number(req.query.month || (now.getMonth() + 1)); // 1-based

  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));

  // Plays in the month
  const plays = await PlayLog.find({
    userId,
    at: { $gte: start, $lt: end },
  }).sort({ at: 1 });

  const totalPlays = plays.length;
  const totalMinutes = plays.reduce((s, p) => s + (p.minutes || 0), 0);

  // First play of the month
  const firstPlay = plays[0] ? {
    itemId: plays[0].itemId,
    type: plays[0].type,
    title: plays[0].title,
    code: plays[0].code,
    name: plays[0].name,
    poster: plays[0].poster,
    backdrop: plays[0].backdrop || plays[0].poster,
    at: plays[0].at,
  } : null;

  // Lifetime library snapshot (optional box on your UI)
  const items = await ProgressItem.find({ userId }).select("type episodesTotal");
  const shows = new Set(items.filter(i => i.type === "tv").map(i => i.itemId)).size;
  const movies = items.filter(i => i.type === "movie").length;
  const episodesInLibrary = items
    .filter(i => i.type === "tv")
    .reduce((s, i) => s + (i.episodesTotal || 0), 0);

  res.json({
    period: { year: y, month: m, start, end },
    plays: totalPlays,
    hours: Math.round(totalMinutes / 60),
    minutes: totalMinutes,
    firstPlay,
    library: {
      shows,
      movies,
      episodes: episodesInLibrary,
    }
  });
});

export default router;
