import Movie from '../models/Movie.js'
import TVShow from '../models/TvShow.js'

export const discoverContent = async (req, res) => {
  const { type, year, quality, genre, country } = req.query;

  const genreList = genre?.split(',') || [];
  const countryList = country?.split(',') || [];

  const buildFilter = (modelType) => {
    const filter = {};

    if (year && year !== 'all') {
      const fromDate = new Date(`${year}-01-01`);
      const toDate = new Date(`${+year + 1}-01-01`);
      filter.release_date = { $gte: fromDate.toISOString(), $lt: toDate.toISOString() };
    }

    if (genreList.length) {
      filter["genres.name"] = { $in: genreList };
    }

    if (countryList.length) {
      filter.origin_country = { $in: countryList }; 
    }

    if (quality && quality !== 'all') {
      filter.quality = quality;
    }

    return filter;
  };

  try {
    let results = [];

    if (type === 'movie') {
      results = await Movie.find(buildFilter('movie')).lean();
      results.forEach((m) => (m._type = 'movie'));
    } else if (type === 'tv') {
      results = await TVShow.find(buildFilter('tv')).lean();
      results.forEach((t) => (t._type = 'tv'));
    } else {
      const [movies, tvs] = await Promise.all([
        Movie.find(buildFilter('movie')).lean(),
        TVShow.find(buildFilter('tv')).lean()
      ]);
      movies.forEach((m) => (m._type = 'movie'));
      tvs.forEach((t) => (t._type = 'tv'));
      results = [...movies, ...tvs];
    }

    return res.json({ results });
  } catch (error) {
    console.error("Discover fetch failed:", error);
    res.status(500).json({ error: "Server error" });
  }
};
