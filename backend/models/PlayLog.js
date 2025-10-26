import mongoose from "mongoose";

const playLogSchema = new mongoose.Schema({
  userId:   { type: String, required: true },
  itemId:   { type: String, required: true },
  type:     { type: String, enum: ["movie", "tv"], required: true },

  title:    { type: String, required: true },
  poster:   { type: String },
  backdrop: { type: String },

  // optional TV episode info
  code:     { type: String },   // e.g. "2x05" or "S02E05"
  name:     { type: String },

  minutes:  { type: Number, default: 0 },  // minutes for this play
  at:       { type: Date, default: Date.now }
}, { timestamps: true });

playLogSchema.index({ userId: 1, at: 1 });
export default mongoose.model("PlayLog", playLogSchema);
