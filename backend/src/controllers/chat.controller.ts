import { Response } from 'express';
import { getUserChats, findOrCreateChat } from '../services/chat.service';
import { getChatMessages } from '../services/message.service';
import { AuthenticatedRequest } from '../middlewares/user.middleware';
import mongoose from 'mongoose';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';

export const fetchUserChats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const chats = await getUserChats(userId);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats', error: err });
  }
};

export const fetchChatMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) return res.status(400).json({ message: 'Invalid chat ID' });
    const messages = await getChatMessages(chatId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err });
  }
};

export const startOrGetChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { participantId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(participantId)) return res.status(400).json({ message: 'Invalid participant ID' });
    const chat = await findOrCreateChat([userId, participantId]);
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to start chat', error: err });
  }
};

// REST: Send message in chat (for Postman testing)
export const sendMessageRest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { content, imageUrl } = req.body;
    const senderId = req.user?.id;
    if (!senderId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(chatId)) return res.status(400).json({ message: 'Invalid chat ID' });
    // Fetch chat to determine receiverId
    const chat = await Chat.findById(chatId).exec();
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const participants = chat.participants.map(id => id.toString());
    const receiverId = participants.find(id => id !== senderId.toString());
    if (!receiverId) return res.status(400).json({ message: 'Cannot determine receiver' });
    const newMsg = await Message.create({ chatId, senderId, receiverId, content, imageUrl, isRead: false });
    // Update chat lastMessage
    await Chat.findByIdAndUpdate(chatId, { lastMessage: { content: content || 'Image', createdAt: newMsg.createdAt } }).exec();
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err });
  }
};
// Update a message's content
export const updateMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId, messageId } = req.params;
    const { content } = req.body;
    if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid chat or message ID' });
    }
    // find and update only if it belongs to this chat
    const updated = await Message.findOneAndUpdate(
      { _id: messageId, chatId },
      { content },
      { new: true }
    ).exec();
    if (!updated) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update message', error: err });
  }
};
// Delete a single message
export const deleteMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId, messageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid chat or message ID' });
    }
    const deleted = await Message.findOneAndDelete({ _id: messageId, chatId }).exec();
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message', error: err });
  }
};
export const deleteChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }
    await Message.deleteMany({ chatId: chatId });
    await Chat.findByIdAndDelete(chatId);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chat', error: err });
  }
};
