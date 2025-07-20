import mongoose, { Schema, Document } from 'mongoose';

export interface IGig extends Document {
    title: string;
    desc: string;
    price: number;
    category: mongoose.Schema.Types.ObjectId;
    fileId: string; 
    imageURL: string;
    userId: mongoose.Schema.Types.ObjectId;
}

const GigSchema: Schema = new Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }, 
    fileId: { type: String, required: true }, 
    imageURL: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IGig>('Gig', GigSchema);
