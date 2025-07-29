import { Router } from 'express';
import { userMiddleware } from '../middlewares/user.middleware';
import {
  fetchUserChats,
  fetchChatMessages,
  startOrGetChat,
  sendMessageRest,
  deleteChat,
  updateMessage,
  deleteMessage,
} from '../controllers/chat.controller';

const router = Router();

// Protect all chat routes
router.use(userMiddleware);

// Get all chats for authenticated user
router.get('/', fetchUserChats);

// Get messages for a specific chat
router.get('/:chatId/messages', fetchChatMessages);

// Send messages for a specific chat
// RESTful send message and update message endpoints
router.post('/:chatId/messages', sendMessageRest);
router.put('/:chatId/messages/:messageId', updateMessage);
// Delete a message
router.delete('/:chatId/messages/:messageId', deleteMessage);

// Start or retrieve a one-to-one chat
router.post('/start', startOrGetChat);
// Delete a chat by ID
router.delete('/:chatId', deleteChat);

export default router;
