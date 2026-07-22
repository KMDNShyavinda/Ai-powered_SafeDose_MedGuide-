const { getModel } = require('../config/gemini');
const AIChatHistory = require('../models/AIChatHistory');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const generateSessionId = () => Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);

exports.sendMessage = async (req, res) => {
  try {
    const model = getModel();
    if (!model) return sendError(res, 'AI Chat service is not available. Please configure GEMINI_API_KEY.', 503);
    const { message, sessionId } = req.body;
    const userId = req.user._id;
    if (!message || message.trim().length === 0) return sendError(res, 'Message is required', 400);
    let chatSession = await AIChatHistory.findOne({ sessionId, user: userId });
    if (!chatSession) {
      chatSession = new AIChatHistory({ user: userId, sessionId: sessionId || generateSessionId(), messages: [], title: message.substring(0, 50) + (message.length > 50 ? '...' : '') });
    }
    const history = chatSession.messages.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();
    chatSession.messages.push({ role: 'user', content: message }, { role: 'model', content: aiResponse });
    await chatSession.save();
    return sendSuccess(res, 'AI response generated', { response: aiResponse, sessionId: chatSession.sessionId });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return sendError(res, 'Failed to generate AI response. Please try again.', 500);
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const sessions = await AIChatHistory.find({ user: req.user._id }).select('sessionId title createdAt updatedAt messages').sort({ updatedAt: -1 }).limit(50);
    const sessionsWithPreview = sessions.map(s => ({ _id: s._id, sessionId: s.sessionId, title: s.title, messageCount: s.messages.length, lastMessage: s.messages.length > 0 ? s.messages[s.messages.length - 1].content.substring(0, 100) : '', createdAt: s.createdAt, updatedAt: s.updatedAt }));
    return sendSuccess(res, 'Chat history fetched', { sessions: sessionsWithPreview });
  } catch (error) { return sendError(res, error.message); }
};

exports.getChatSession = async (req, res) => {
  try {
    const session = await AIChatHistory.findOne({ sessionId: req.params.sessionId, user: req.user._id });
    if (!session) return sendError(res, 'Chat session not found', 404);
    return sendSuccess(res, 'Chat session fetched', { session });
  } catch (error) { return sendError(res, error.message); }
};

exports.deleteChatSession = async (req, res) => {
  try {
    const session = await AIChatHistory.findOneAndDelete({ sessionId: req.params.sessionId, user: req.user._id });
    if (!session) return sendError(res, 'Chat session not found', 404);
    return sendSuccess(res, 'Chat session deleted');
  } catch (error) { return sendError(res, error.message); }
};

exports.createNewSession = async (req, res) => {
  try {
    const sessionId = generateSessionId();
    return sendSuccess(res, 'New session created', { sessionId }, 201);
  } catch (error) { return sendError(res, error.message); }
};
