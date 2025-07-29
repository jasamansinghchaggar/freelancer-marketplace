import { Message, IMessage } from '../models/message.model';

/**
 * Get all messages for a chat, sorted by creation time asc
 */
export const getChatMessages = async (chatId: string): Promise<IMessage[]> => {
  return Message.find({ chatId })
    .sort({ createdAt: 1 })
    .exec();
};
