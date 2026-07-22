const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getChatSession, deleteChatSession, createNewSession } = require('../controllers/aiChatController');
const { protect } = require('../middleware/auth');
const { aiChatLimiter } = require('../middleware/rateLimiter');

router.post('/message', protect, aiChatLimiter, sendMessage);
router.post('/send', protect, aiChatLimiter, sendMessage);
router.post('/new-session', protect, createNewSession);
router.post('/session/new', protect, createNewSession);
router.get('/history', protect, getChatHistory);
router.get('/history/:sessionId', protect, getChatSession);
router.get('/session/:sessionId', protect, getChatSession);
router.delete('/history/:sessionId', protect, deleteChatSession);
router.delete('/session/:sessionId', protect, deleteChatSession);

module.exports = router;
