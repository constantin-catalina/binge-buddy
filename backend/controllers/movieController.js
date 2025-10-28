import axios from "axios";
import Movie from "../models/Movie.js";

export const listAllMovies = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "28", 10));
    const q = (req.query.q || "").trim();

    const filter = q ? { title: { $regex: q, $options: "i" } } : {};

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Movie.countDocuments(filter),
    ]);

    res.json({
      success: true,
      page,
      limit,
      total,
      pageCount: Math.ceil(total / limit),
      movies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load movies." });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }
    res.json({ success: true, movie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load movie." });
  }
};

export const getMovies = async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.themoviedb.org/3/movie/now_playing`, {
      headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
    });
    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
