import express from "express";
import { requireAuth } from "@clerk/express";
import ProgressItem from "../models/ProgressItem.js";
import PlayLog from "../models/PlayLog.js";

const router = express.Router();
router.use(requireAuth());

// GET list
router.get("/", async (req, res) => {
  const items = await ProgressItem.find({ userId: req.auth.userId }).sort({ updatedAt: -1 });
  res.json({ items });
});

// POST add to history (idempotent upsert + optional increments/sets)
router.post("/", async (req, res) => {
  const userId = req.auth.userId;
  const {
    itemId, type, title, poster, backdrop, year, runtime, genres = [], rating,
    incPlays = 1,
    incMinutes = 0,
    tv = {}
  } = req.body || {};

  if (!itemId || !type || !title) {
    return res.status(400).json({ error: "itemId, type, and title are required" });
  }

  const {
    episodesTotal,
    seasonsTotal,
    incEpisode = false,
    incEpisodes,
    setEpisodesWatched,
    last = null, // { code, name, at }
  } = tv;

  const resolvedTotal =
    typeof episodesTotal === "number"
      ? episodesTotal
      : (typeof seasonsTotal === "number" ? seasonsTotal : undefined);

  const $set = { type, title, poster, year, runtime, genres, rating };
  if (typeof resolvedTotal === "number") $set.episodesTotal = resolvedTotal;
  if (last && (last.code || last.name || last.at)) $set.lastWatched = last;

  const $inc = { plays: incPlays, minutesWatched: incMinutes };

  if (typeof setEpisodesWatched === "number") {
    $set.episodesWatched = setEpisodesWatched;
  } else if (typeof incEpisodes === "number") {
    $inc.episodesWatched = incEpisodes;
  } else if (incEpisode) {
    $inc.episodesWatched = 1;
  }

  // upsert progress
  const item = await ProgressItem.findOneAndUpdate(
    { userId, itemId },
    { $set, $setOnInsert: { userId, addedAt: new Date() }, $inc },
    { upsert: true, new: true }
  );

  // Log plays so we can compute monthly stats exactly
  // one row per play (runtime is minutes per play; for TV this is per-episode runtime)
  const minutesPerPlay = Number(runtime || 0) || 0;
  const logs = [];
  const globalAt = req.body.at ? new Date(req.body.at) : null;
  const playAt = (last && last.at) ? new Date(last.at) : (globalAt || new Date());

  for (let i = 0; i < incPlays; i++) {
    logs.push({
      userId,
      itemId,
      type,
      title,
      poster,
      backdrop,                     // optional wide image
      code: last?.code,
      name: last?.name,
      minutes: minutesPerPlay,
      at: playAt,
    });
  }
  if (logs.length) await PlayLog.insertMany(logs);

  res.status(201).json({ item });
});

// DELETE remove progress entry
router.delete("/:itemId", async (req, res) => {
  const userId = req.auth.userId;
  const { itemId } = req.params;

  await ProgressItem.findOneAndDelete({ userId, itemId });
  await PlayLog.deleteMany({ userId, itemId });

  res.json({ ok: true });
});

export default router;
