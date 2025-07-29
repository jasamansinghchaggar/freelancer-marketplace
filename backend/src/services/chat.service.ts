import { Chat, IChat } from '../models/chat.model';
import mongoose from 'mongoose';

/**
 * Get all chats for a user, sorted by updatedAt desc
 */
export const getUserChats = async (userId: string): Promise<IChat[]> => {
  return Chat.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name online lastSeen')
    .exec();
};

/**
 * Find or create a chat between participants
 */
export const findOrCreateChat = async (participants: string[]): Promise<IChat> => {
  const existing = await Chat.findOne({ participants: { $all: participants, $size: participants.length } });
  if (existing) {
    await existing.populate('participants', 'name online lastSeen');
    return existing;
  }
  const chat = new Chat({ participants });
  const saved = await chat.save();
  await saved.populate('participants', 'name online lastSeen');
  return saved;
};
