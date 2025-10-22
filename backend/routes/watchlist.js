import express from "express";
import { requireAuth } from "@clerk/express";
import WatchlistItem from "../models/WatchlistItem.js";

const router = express.Router();

// All routes below require a signed-in user
router.use(requireAuth());

// GET /api/watchlist  -> list current user's items
router.get("/", async (req, res) => {
  const userId = req.auth.userId;
  const items = await WatchlistItem.find({ userId }).sort({ addedAt: -1 });
  res.json({ items });
});

// GET /api/watchlist/:itemId -> quick status check
router.get("/:itemId", async (req, res) => {
  const userId = req.auth.userId;
  const { itemId } = req.params;
  const item = await WatchlistItem.findOne({ userId, itemId });
  res.json({ exists: !!item, item });
});

// POST /api/watchlist -> add or update (idempotent)
router.post("/", async (req, res) => {
  const userId = req.auth.userId;
  const {
    itemId,
    type,        // 'movie' | 'tv'
    title,
    poster,
    year,
    runtime,
    genres = [],
    rating,
    seasons,
    progress = 0,
  } = req.body || {};

  if (!itemId || !type || !title) {
    return res.status(400).json({ error: "itemId, type and title are required" });
  }

  try {
    const now = new Date();
    const item = await WatchlistItem.findOneAndUpdate(
      { userId, itemId },
      {
        $set: {
          type, title, poster, year, runtime, genres, rating, seasons,
          addedAt: now,
        },
        $setOnInsert: { userId, progress },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ item });
  } catch (err) {
    // Handle unique index races cleanly
    if (err.code === 11000) {
      const item = await WatchlistItem.findOne({ userId, itemId });
      return res.status(200).json({ item });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

// DELETE /api/watchlist/:itemId -> remove from watchlist
router.delete("/:itemId", async (req, res) => {
  const userId = req.auth.userId;
  const { itemId } = req.params;
  await WatchlistItem.findOneAndDelete({ userId, itemId });
  res.json({ ok: true });
});

export default router;
