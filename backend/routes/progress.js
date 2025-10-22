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

// POST add to history (idempotent upsert + optional increments)
router.post("/", async (req, res) => {
  const userId = req.auth.userId;
  const {
    itemId, type, title, poster, year, runtime, genres = [], rating,
    // optional progress updates:
    incPlays = 1,
    incMinutes = 0,
    tv: {
      episodesTotal,
      incEpisode = false,
      last = null,   // { code, name, at }
    } = {}
  } = req.body || {};

  if (!itemId || !type || !title) {
    return res.status(400).json({ error: "itemId, type, and title are required" });
  }

  const $set = { type, title, poster, year, runtime, genres, rating };
  if (typeof episodesTotal === "number") $set.episodesTotal = episodesTotal;

  const update = {
    $set,
    $setOnInsert: { userId, addedAt: new Date() },
    $inc: { plays: incPlays, minutesWatched: incMinutes },
  };
  if (incEpisode) update.$inc.episodesWatched = 1;
  if (last && (last.code || last.name || last.at)) update.$set.lastWatched = last;

  const item = await ProgressItem.findOneAndUpdate(
    { userId, itemId },
    update,
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
