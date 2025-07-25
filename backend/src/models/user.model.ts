import mongoose, { Document, Schema } from "mongoose";


export type UserRole = "freelancer" | "client" | "guest";


export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  googleId?: string;
  profileCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}



const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, select: false },
    role: { type: String, enum: ["freelancer", "client", "guest"], required: true },
    googleId: { type: String, required: false, unique: true, sparse: true },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
