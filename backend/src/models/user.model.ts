import mongoose, { Document, Schema } from "mongoose";


export type UserRole = "freelancer" | "client" | "guest";


export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  googleId?: string;
  profileCompleted?: boolean;
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  publicKey?: string;
}



const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, select: false },
    role: { type: String, enum: ["freelancer", "client", "guest"], required: true },
    googleId: { type: String, required: false, unique: true, sparse: true },
    profileCompleted: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    resetPasswordToken: { type: String, required: false, select: false },
    resetPasswordExpires: { type: Date, required: false },
    publicKey: { type: String, required: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
