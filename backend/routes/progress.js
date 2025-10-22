import express from "express";
import { requireAuth } from "@clerk/express";
import ProgressItem from "../models/ProgressItem.js";

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
    itemId, type, title, poster, year, runtime, genres = [], rating,
    incPlays = 1,
    incMinutes = 0,
    tv = {}
  } = req.body || {};

  if (!itemId || !type || !title) {
    return res.status(400).json({ error: "itemId, type, and title are required" });
  }

  // Accept either episodesTotal or seasonsTotal (alias), plus ways to set/increment watched
  const {
    episodesTotal,
    seasonsTotal,                // alias for episodesTotal when you store "seasons" as "episodes"
    incEpisode = false,
    incEpisodes,                 // number to increment watched by
    setEpisodesWatched,          // absolute setter
    last = null,                 // { code, name, at }
  } = tv;

  const resolvedTotal =
    typeof episodesTotal === "number"
      ? episodesTotal
      : (typeof seasonsTotal === "number" ? seasonsTotal : undefined);

  const $set = { type, title, poster, year, runtime, genres, rating };
  if (typeof resolvedTotal === "number") $set.episodesTotal = resolvedTotal;
  if (last && (last.code || last.name || last.at)) $set.lastWatched = last;

  // Build update
  const $inc = { plays: incPlays, minutesWatched: incMinutes };

  // If client wants to set an absolute value, prefer $set over $inc
  if (typeof setEpisodesWatched === "number") {
    $set.episodesWatched = setEpisodesWatched;
  } else if (typeof incEpisodes === "number") {
    $inc.episodesWatched = incEpisodes;
  } else if (incEpisode) {
    $inc.episodesWatched = 1;
  }

  const item = await ProgressItem.findOneAndUpdate(
    { userId, itemId },
    {
      $set,
      $setOnInsert: { userId, addedAt: new Date() },
      $inc,
    },
    { upsert: true, new: true }
  );

  res.status(201).json({ item });
});

// DELETE remove progress entry
router.delete("/:itemId", async (req, res) => {
  await ProgressItem.findOneAndDelete({ userId: req.auth.userId, itemId: req.params.itemId });
  res.json({ ok: true });
});

export default router;
