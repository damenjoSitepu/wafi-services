import mongoose, { Schema } from "mongoose";

interface User extends Document {
  uid: string;
  name: string;
  email: string;
  password: string;
  classifiedAs: string;
  createdAt: number;
  updatedAt: number;
  modifiedBy: string;
  isActive: boolean;
  activationToken: string;
  activationTokenExpiredAt: number;
  access: {
    verifyUserAt: number;
    verifyUserThrottle: number;
  }
}

const UserSchema = new Schema<User>({
  uid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  classifiedAs: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Number,
    required: true,
  },
  modifiedBy: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  activationToken: {
    type: String,
    required: false,
  },
  activationTokenExpiredAt: {
    type: Number,
    required: false,
  },
  access: {
    verifyUserAt: { type: Number },
    verifyUserThrottle: { type: Number },
  },
});

export const UserModel = mongoose.model<User>("users", UserSchema);