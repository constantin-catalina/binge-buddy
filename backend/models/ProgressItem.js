import mongoose from "mongoose";

const lastWatchedSchema = new mongoose.Schema({
  code: String,  
  name: String,   
  at: Date,
}, { _id: false });

const progressItemSchema = new mongoose.Schema({
  userId:   { type: String, required: true },
  itemId:   { type: String, required: true }, 
  type:     { type: String, enum: ["movie", "tv"], required: true },

  // metadata for cards
  title:    { type: String, required: true },
  poster:   { type: String },
  year:     { type: String },
  runtime:  { type: Number },     // minutes (per episode for TV)
  genres:   [String],
  rating:   { type: Number },

  // PROGRESS
  plays:            { type: Number, default: 0 },     // movies or tv
  episodesTotal:    { type: Number },                 // TV (optional)
  episodesWatched:  { type: Number, default: 0 },     // TV
  minutesWatched:   { type: Number, default: 0 },     // Movies/TV (rough)
  lastWatched:      { type: lastWatchedSchema },      // TV

  addedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

progressItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export default mongoose.model("ProgressItem", progressItemSchema);
