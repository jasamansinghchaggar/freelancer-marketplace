import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: {
    content: string;
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
      createdAt: { type: Date, required: false }
    }
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
