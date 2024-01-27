import mongoose, { Schema } from "mongoose";

const DashboardSchema = new Schema({
  uid: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  value: {
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

export const DashboardModel = mongoose.model("dashboards", DashboardSchema, "dashboards");