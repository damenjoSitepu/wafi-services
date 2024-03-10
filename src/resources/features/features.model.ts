import mongoose, { Document, Schema } from "mongoose";

interface Features extends Document {
  uid: string;
  fid: string;
  name: string;
  parent: string | null;
  isActive: boolean;
  childIds: string[];
  allChildIds: string[];
  createdAt: number;
  updatedAt: number;
  modifiedBy: string;
}

const FeaturesSchema = new Schema<Features>({
  uid: {
    type: String,
    required: true,
  },
  fid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  parent: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  childIds: {
    type: [String],
    required: false,
  },
  allChildIds: {
    type: [String],
    required: false,
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
}, {
  toObject: {
    getters: true,
  },
});

// Define Is 
FeaturesSchema.virtual("isAbleToExpand").get(function () {
  try {
    return this.childIds.length > 0;
  } catch (e: any) {
    return false;
  }
});

export const FeaturesModel = mongoose.model<Features>("features", FeaturesSchema, "features");