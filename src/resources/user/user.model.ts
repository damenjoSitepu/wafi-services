import mongoose, { Schema } from "mongoose";

interface User extends Document {
  uid: string;
  name: string;
  email: string;
  createdAt: number;
  updatedAt: number;
  modifiedBy: string;
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
});

export const UserModel = mongoose.model<User>("users", UserSchema);