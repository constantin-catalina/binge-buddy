import TvShow from "../models/TvShow.js";

export const listAllShows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 32;
    const page = parseInt(req.query.page) || 1;

    const shows = await TvShow.find({})
      .sort({ vote_average: -1 }) // highest rated first
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await TvShow.countDocuments();

    res.json({
      shows,
      total: count,
      page,
      pageCount: Math.ceil(count / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getShowById = async (req, res) => {
  try {
    const show = await TvShow.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: "TV Show not found" });
    }
    res.json(show);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching show details" });
  }
};
