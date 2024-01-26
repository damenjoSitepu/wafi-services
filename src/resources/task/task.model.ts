import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema({
  wuid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
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
})

export const TaskModel = mongoose.model("tasks", TaskSchema);