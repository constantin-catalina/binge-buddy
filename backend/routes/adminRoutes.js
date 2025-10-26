import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import { clerkClient } from "@clerk/express";
import Movie from "../models/Movie.js";
import TvShow from "../models/TvShow.js";

const router = express.Router();

/* ---------- Admin check & summary ---------- */

router.get("/check", protectAdmin, (_req, res) => res.json({ isAdmin: true }));

router.get("/summary", protectAdmin, async (_req, res) => {
  try {
    const [movieCount, tvCount, usersList] = await Promise.all([
      Movie.countDocuments({}),
      TvShow.countDocuments({}),
      clerkClient.users.getUserList({ limit: 1 }),
    ]);

    const userCount = usersList?.totalCount ?? 0;

    res.json({
      movies: movieCount,
      tvShows: tvCount,
      entries: movieCount + tvCount,
      users: userCount,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load admin summary" });
  }
});

/* ---------- Clerk users CRUD ---------- */

/** LIST users */
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const { q = "", limit = "50", offset = "0" } = req.query;

    const list = await clerkClient.users.getUserList({
      query: q || undefined,
      limit: Number(limit),
      offset: Number(offset),
      orderBy: "-created_at",
    });

    const users = list.data.map((u) => ({
      _id: u.id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email:
        u.primaryEmailAddress?.emailAddress ||
        u.emailAddresses?.[0]?.emailAddress ||
        "",
    }));

    res.json({ users, total: list.totalCount });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list users" });
  }
});

/** GET one user */
router.get("/users/:id", protectAdmin, async (req, res) => {
  try {
    const u = await clerkClient.users.getUser(req.params.id);
    const user = {
      _id: u.id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email:
        u.primaryEmailAddress?.emailAddress ||
        u.emailAddresses?.[0]?.emailAddress ||
        "",
    };
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: "User not found" });
  }
});

/** ADD user (invite) */
router.post("/users", protectAdmin, async (req, res) => {
  try {
    const { firstName = "", lastName = "", email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const invite = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { createdByAdmin: true, firstName, lastName },
      redirectUrl:
        process.env.CLERK_INVITE_REDIRECT_URL ||
        "http://localhost:5173/sign-in",
    });

    res.status(201).json({ invitationId: invite.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to invite user" });
  }
});

/** EDIT user (name only) */
router.patch("/users/:id", protectAdmin, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const u = await clerkClient.users.updateUser(req.params.id, {
      firstName,
      lastName,
    });
    res.json({
      _id: u.id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update user" });
  }
});

/** DELETE user */
router.delete("/users/:id", protectAdmin, async (req, res) => {
  try {
    await clerkClient.users.deleteUser(req.params.id);
    res.sendStatus(204);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

/* ---------- Shows CRUD (Movies + TV) ---------- */

// Normalize DB docs for the admin UI & public views
const normalize = (doc, type) => ({
  _id: String(doc._id),
  type,
  title: doc.title || doc.name || "Untitled",
  backdrop_path: doc.backdrop_path || doc.poster_path || "",
  vote_average: Number(doc.vote_average ?? 0),
  // Always return TMDB-style: [{ name }]
  genres: Array.isArray(doc.genres)
    ? doc.genres.map((g) =>
        typeof g === "string" ? { name: g } : { name: g?.name ?? g }
      )
    : [],
  release_date: doc.release_date || doc.first_air_date || "",
  runtime: doc.runtime || undefined,
});

// GET /api/admin/shows?q=&type=all|movie|tv&limit=&page=
router.get("/shows", protectAdmin, async (req, res) => {
  try {
    const { q = "", type = "all", limit = "24", page = "1" } = req.query;
    const lim = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * lim;
    const rx = q ? new RegExp(q, "i") : null;

    const movieQuery = rx ? { title: rx } : {};
    const tvQuery = rx ? { name: rx } : {};

    const tasks = [];
    if (type !== "tv")
      tasks.push(Movie.find(movieQuery).sort({ _id: -1 }).skip(skip).limit(lim));
    if (type !== "movie")
      tasks.push(TvShow.find(tvQuery).sort({ _id: -1 }).skip(skip).limit(lim));

    const [movies = [], shows = []] =
      (tasks.length === 2
        ? await Promise.all(tasks)
        : [...(await Promise.all(tasks)), []]) || [];

    const list = [
      ...movies.map((m) => normalize(m, "movie")),
      ...shows.map((s) => normalize(s, "tv")),
    ].slice(0, lim);

    res.json({ shows: list, total: list.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list shows" });
  }
});

// GET /api/admin/shows/:id
router.get("/shows/:id", protectAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let doc = await Movie.findById(id);
    if (doc) return res.json({ show: normalize(doc, "movie") });
    doc = await TvShow.findById(id);
    if (doc) return res.json({ show: normalize(doc, "tv") });
    return res.status(404).json({ message: "Show not found" });
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: "Show not found" });
  }
});

// Helper: coerce incoming genres to TMDB-style objects [{name}]
const coerceGenresToObjects = (genres) => {
  if (typeof genres === "string") {
    return genres
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
  }
  if (Array.isArray(genres)) {
    return genres
      .map((g) => (typeof g === "string" ? { name: g } : { name: g?.name || "" }))
      .filter((g) => g.name);
  }
  return undefined;
};

// POST /api/admin/shows
router.post("/shows", protectAdmin, async (req, res) => {
  try {
    const { type, ...payload } = req.body;
    if (!type || !["movie", "tv"].includes(type)) {
      return res.status(400).json({ message: "type must be 'movie' or 'tv'" });
    }
    const Model = type === "movie" ? Movie : TvShow;

    const coerced = { ...payload };
    const genresAsObjects = coerceGenresToObjects(coerced.genres);
    if (genresAsObjects) coerced.genres = genresAsObjects;

    const created = await Model.create(coerced);
    res.status(201).json({ show: normalize(created, type) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create show" });
  }
});

// PATCH /api/admin/shows/:id
router.patch("/shows/:id", protectAdmin, async (req, res) => {
  try {
    const update = { ...req.body };

    const genresAsObjects = coerceGenresToObjects(update.genres);
    if (genresAsObjects) update.genres = genresAsObjects;

    let doc = await Movie.findByIdAndUpdate(req.params.id, update, { new: true });
    if (doc) return res.json({ show: normalize(doc, "movie") });

    doc = await TvShow.findByIdAndUpdate(req.params.id, update, { new: true });
    if (doc) return res.json({ show: normalize(doc, "tv") });

    res.status(404).json({ message: "Show not found" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update show" });
  }
});

// DELETE /api/admin/shows/:id
router.delete("/shows/:id", protectAdmin, async (req, res) => {
  try {
    let doc = await Movie.findByIdAndDelete(req.params.id);
    if (!doc) doc = await TvShow.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Show not found" });
    res.sendStatus(204);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete show" });
  }
});

export default router;
