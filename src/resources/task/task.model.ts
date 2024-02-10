import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema({
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
});

export const TaskModel = mongoose.model("tasks", TaskSchema);