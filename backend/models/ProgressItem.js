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

  title:    { type: String, required: true },
  poster:   { type: String },
  year:     { type: String },
  runtime:  { type: Number },     
  genres:   [String],
  rating:   { type: Number },

  plays:            { type: Number, default: 0 },     
  episodesTotal:    { type: Number },                 
  episodesWatched:  { type: Number, default: 0 },     
  minutesWatched:   { type: Number, default: 0 },     
  lastWatched:      { type: lastWatchedSchema },      

  addedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

progressItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export default mongoose.model("ProgressItem", progressItemSchema);
