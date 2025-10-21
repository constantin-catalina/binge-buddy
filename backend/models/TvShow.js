import mongoose from "mongoose";

const tvShowSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, 
    name: { type: String, required: true }, 
    overview: { type: String, required: true },
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    first_air_date: { type: String, required: true },
    original_language: { type: String },
    tagline: { type: String },
    genres: { type: Array, required: true },
    casts: { type: Array, required: true },
    vote_average: { type: Number, required: true },
    number_of_seasons: { type: Number, required: true },
    number_of_episodes: { type: Number, required: true },
  },
  { timestamps: true }
);

const TvShow = mongoose.model("TvShow", tvShowSchema);

export default TvShow;
