import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  gigId: mongoose.Schema.Types.ObjectId;
  clientId: mongoose.Schema.Types.ObjectId;
  freelancerId: mongoose.Schema.Types.ObjectId;
}

const PurchaseSchema: Schema = new Schema(
  {
    gigId: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
