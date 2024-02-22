import mongoose, { Schema } from "mongoose";

interface Task extends Document {
  uid: string;
  name: string;
  assignedAt: number;
  isStarred: boolean;
  order: number;
  status: {
    _id: string;
    name: string;
    color: string;
  },
  createdAt: number;
  updatedAt: number;
  modifiedBy: string;
}

const TaskSchema = new Schema<Task>({
  uid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  assignedAt: {
    type: Number,
    required: true,
  },
  isStarred: {
    type: Boolean,
    required: false,
  },
  order: {
    type: Number,
    required: true,
  },
  status: {
    _id: { type: String },
    name: { type: String },
    color: { type: String },
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

export const TaskModel = mongoose.model<Task>("tasks", TaskSchema);