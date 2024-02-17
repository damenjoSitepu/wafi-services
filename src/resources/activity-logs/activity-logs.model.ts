import mongoose, { Document, Schema } from "mongoose";

interface ActivityLogs extends Document {
  uid: string;
  type: string;
  topic: string;
  message: string;
  routeToView: string;
  payloads: Array<Array<{ key: string; value: any }>>;
  navigationWorkflow: string[];
  createdAt: number;
  modifiedBeforeBy: {
    uid: string;
    name: string;
    email: string;
  },
  modifiedAfterBy: {
    uid: string;
    name: string;
    email: string;
  }
}

const ActivityLogsSchema = new Schema<ActivityLogs>({
  uid: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  routeToView: {
    type: String,
    required: true,
  },
  payloads: {
    type: [[{ key: String, value: Schema.Types.Mixed }]],
    required: true,
  },
  navigationWorkflow: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  modifiedBeforeBy: {
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
  },
  modifiedAfterBy: {
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
  },
});

export const ActivityLogsModel = mongoose.model<ActivityLogs>("activity_logs", ActivityLogsSchema, "activityLogs");