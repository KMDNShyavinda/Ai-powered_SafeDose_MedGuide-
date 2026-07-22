const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const aiChatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  title: { type: String, default: 'New Conversation' },
  messages: [messageSchema],
  feedbackRating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

aiChatHistorySchema.index({ user: 1, createdAt: -1 });
aiChatHistorySchema.index({ sessionId: 1 });

module.exports = mongoose.model('AIChatHistory', aiChatHistorySchema);
