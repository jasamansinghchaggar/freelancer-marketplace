import { Response } from 'express';
import { getUserChats, findOrCreateChat } from '../services/chat.service';
import { getChatMessages } from '../services/message.service';
import { AuthenticatedRequest } from '../middlewares/user.middleware';
import mongoose from 'mongoose';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';
import imageKitConfig from '../configs/imageKit.config';

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
    // support encrypted payload: content or (nonce, data)
    const { nonce, data: cipher, content, imageUrl } = req.body;
    const senderId = req.user?.id;
    if (!senderId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(chatId)) return res.status(400).json({ message: 'Invalid chat ID' });
    // Fetch chat to determine receiverId
    const chat = await Chat.findById(chatId).exec();
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const participants = chat.participants.map(id => id.toString());
    const receiverId = participants.find(id => id !== senderId.toString());
    if (!receiverId) return res.status(400).json({ message: 'Cannot determine receiver' });
    // Create and save message
    const newMsg = await Message.create({
      chatId,
      senderId,
      receiverId,
      content,
      nonce,
      cipher,
      imageUrl,
      isRead: false
    });
    // Update lastMessage with full encryption fields for preview
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        content: newMsg.content,
        nonce: newMsg.nonce,
        cipher: newMsg.cipher,
        createdAt: newMsg.createdAt
      }
    }).exec();
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
    // Find message and delete associated image if present
    const msg = await Message.findOne({ _id: messageId, chatId }).exec();
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' });
    }
    if (msg.imageFileId) {
      try {
        await imageKitConfig.deleteFile(msg.imageFileId);
      } catch (e) {
        console.error('Failed to delete image from ImageKit:', e);
      }
    }
    await Message.deleteOne({ _id: messageId, chatId }).exec();
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
    // Delete all images associated with messages in this chat
    const msgsWithImages = await Message.find({ chatId, imageFileId: { $exists: true, $ne: null } }).exec();
    await Promise.all(msgsWithImages.map(async (m) => {
      if (m.imageFileId) {
        try {
          await imageKitConfig.deleteFile(m.imageFileId);
        } catch (e) {
          console.error('Failed to delete image from ImageKit for message', m._id, e);
        }
      }
    }));
    await Message.deleteMany({ chatId: chatId }).exec();
    await Chat.findByIdAndDelete(chatId).exec();
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chat', error: err });
  }
};
/**
 * Upload chat image and create message
 */
export const uploadImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const file = (req as any).file;
    if (!file) return res.status(400).json({ message: 'No image uploaded' });
    const senderId = req.user?.id;
    if (!senderId) return res.status(401).json({ message: 'Unauthorized' });
    // Find chat and determine receiver
    const chat = await Chat.findById(chatId).exec();
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const participants = chat.participants.map((id) => id.toString());
    const receiverId = participants.find((id) => id !== senderId.toString());
    if (!receiverId) return res.status(400).json({ message: 'Cannot determine receiver' });
    // Upload image to ImageKit
    const uploadResponse = await imageKitConfig.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: `chat_images/${chatId}`
    });
    // Create message with imageUrl
    const newMsg = await Message.create({
      chatId,
      senderId,
      receiverId,
      imageUrl: uploadResponse.url,
      imageFileId: uploadResponse.fileId,
      isRead: false
    });
    // Emit message to chat room via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('receiveMessage', newMsg);
    }
    // Update lastMessage in chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: { content: 'Image', createdAt: newMsg.createdAt } }).exec();
    res.status(201).json(newMsg);
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ message: 'Failed to upload image', error: err });
  }
};
