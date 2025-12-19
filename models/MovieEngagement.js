const mongoose = require('mongoose');

const MovieEngagementSchema = new mongoose.Schema(
  {
    movieTitle: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    saveCount: {
      type: Number,
      default: 0
    },
    trailerViews: {
      type: Number,
      default: 0
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now
    },
    lastViewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

MovieEngagementSchema.index({ lastInteractionAt: -1 });

module.exports = mongoose.model('MovieEngagement', MovieEngagementSchema);
