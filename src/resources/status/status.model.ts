import mongoose, { Document, Schema } from "mongoose";

interface Status extends Document {
  uid: string;
  name: string;
  description: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

const StatusSchema = new Schema<Status>({
  uid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  color: {
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
});

export const StatusModel = mongoose.model<Status>("statuses", StatusSchema);