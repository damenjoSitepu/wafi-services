import mongoose, { Document, Schema } from "mongoose";

interface ActivityLogsTimeline extends Document {
  uid: string;
  subjectId: string;
  createdAt: number;
  activityLogs: { _id: string, message: string, createdAt: number }[];
}

const ActivityLogsTimelineSchema = new Schema<ActivityLogsTimeline>({
  uid: {
    type: String,
    required: true,
  },
  subjectId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  activityLogs: [{
    _id: { type: String },
    message: { type: String },
    createdAt: { type: String }
  }]
});

export const ActivityLogsTimelineModel = mongoose.model<ActivityLogsTimeline>("activity_logs_timeline", ActivityLogsTimelineSchema, "activityLogsTimeline");