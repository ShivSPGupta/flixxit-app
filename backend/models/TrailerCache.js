const mongoose = require('mongoose');

const trailerCacheSchema = new mongoose.Schema(
  {
    titleKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    movieTitle: {
      type: String,
      required: true,
      trim: true,
    },
    trailerKey: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrailerCache', trailerCacheSchema);
