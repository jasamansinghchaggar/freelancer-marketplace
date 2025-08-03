import { Chat, IChat } from '../models/chat.model';
import mongoose from 'mongoose';

export const getUserChats = async (userId: string): Promise<IChat[]> => {
  return Chat.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name online lastSeen publicKey')
    .exec();
};

export const findOrCreateChat = async (participants: string[]): Promise<IChat> => {
  const existing = await Chat.findOne({ participants: { $all: participants, $size: participants.length } });
  if (existing) {
    await existing.populate('participants', 'name online lastSeen publicKey');
    return existing;
  }
  const chat = new Chat({ participants });
  const saved = await chat.save();
  await saved.populate('participants', 'name online lastSeen publicKey');
  return saved;
};
