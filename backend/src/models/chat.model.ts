import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: {
    content?: string;
    nonce?: string;
    cipher?: string;
    senderId?: mongoose.Types.ObjectId;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema<IChat>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    lastMessage: {
      content: { type: String, required: false },
      nonce: { type: String, required: false },
      cipher: { type: String, required: false },
      senderId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
      createdAt: { type: Date, required: false }
    }
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
