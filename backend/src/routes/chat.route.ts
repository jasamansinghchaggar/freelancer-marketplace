import { Router } from 'express';
import { userMiddleware } from '../middlewares/user.middleware';
import {
  fetchUserChats,
  fetchChatMessages,
  startOrGetChat,
  sendMessageRest,
} from '../controllers/chat.controller';

const router = Router();

// Protect all chat routes
router.use(userMiddleware);

// Get all chats for authenticated user
router.get('/', fetchUserChats);

// Get messages for a specific chat
router.get('/:chatId/messages', fetchChatMessages);

// Send messages for a specific chat
router.post('/:chatId/messages', sendMessageRest);

// Start or retrieve a one-to-one chat
router.post('/start', startOrGetChat);

export default router;
