const MovieEngagement = require('../models/MovieEngagement');

async function adjustWatchlistCount(movieTitle, delta = 1) {
  if (!movieTitle || !delta || Number.isNaN(delta)) return null;
  const now = new Date();
  const engagement = await MovieEngagement.findOneAndUpdate(
    { movieTitle },
    {
      $inc: { saveCount: delta },
      $set: { lastInteractionAt: now }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  if (engagement && engagement.saveCount < 0) {
    engagement.saveCount = 0;
    await engagement.save();
  }

  return engagement ? engagement.toObject() : null;
}

async function recordTrailerView(movieTitle, metadata = {}) {
  if (!movieTitle) return null;
  const now = new Date();
  const engagement = await MovieEngagement.findOneAndUpdate(
    { movieTitle },
    {
      $inc: { trailerViews: 1 },
      $set: {
        lastInteractionAt: now,
        lastViewerId: metadata.userId || null
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
  return engagement ? engagement.toObject() : null;
}

async function getEngagementSnapshot() {
  const docs = await MovieEngagement.find({}).lean();
  return docs.reduce((acc, doc) => {
    acc[doc.movieTitle] = {
      trailerViews: doc.trailerViews || 0,
      saveCount: doc.saveCount || 0,
      lastInteractionAt: doc.lastInteractionAt
    };
    return acc;
  }, {});
}

module.exports = {
  adjustWatchlistCount,
  recordTrailerView,
  getEngagementSnapshot
};
