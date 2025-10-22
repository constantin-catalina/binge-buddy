import mongoose from "mongoose";

const watchlistItemSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  itemId: { type: String, required: true }, 
  type: { type: String, enum: ['movie', 'tv'], required: true },
  title: { type: String, required: true },
  poster: { type: String },
  year: { type: String },
  runtime: { type: Number },
  genres: [String],
  rating: { type: Number },
  progress: { type: Number, default: 0 },
  addedAt: { type: Date, default: Date.now },
}, { timestamps: true });

watchlistItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

const WatchlistItem = mongoose.model('WatchlistItem', watchlistItemSchema);
export default WatchlistItem;
