const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skill: { type: String, required: true },
  type: { type: String, required: true },
});

// ⭐ Rating Schema
const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  with: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [messageSchema],
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  canTeach: { type: String, default: "" },

  wantToLearn: { type: String, default: "" },

  pricePerHour: { type: Number, default: 0 }, // 0 = free/swap only

  requests: [requestSchema],

  acceptedRequests: [requestSchema],

  chat: [chatSchema],

  // ⭐ NEW FIELD
  ratings: [ratingSchema],
});

// ⭐ Rating summary method
userSchema.methods.getRatingSummary = function () {
  const totalReviews = this.ratings.length;
  if (totalReviews === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  const avg =
    this.ratings.reduce((sum, r) => sum + r.stars, 0) / totalReviews;

  return {
    averageRating: Number(avg.toFixed(1)),
    totalReviews,
  };
};

module.exports = mongoose.model("User", userSchema);
