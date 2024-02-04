import mongoose, { Document, Schema } from "mongoose";

interface MicrosoftTeamsIntegration extends Document {
  uid: string 
  clientId: string;
  tenantId: string;
  userScopes: string[];
  accessToken?: string;
  accessTokenExpiresOn?: number;
  createdAt: number;
  updatedAt: number;
}

const MicrosoftTeamsIntegrationSchema = new Schema<MicrosoftTeamsIntegration>({
  uid: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  tenantId: {
    type: String,
    required: true,
  },
  userScopes: {
    type: [String],
    required: true,
  },
  accessToken: {
    type: String,
    required: false,
  },
  accessTokenExpiresOn: {
    type: Number,
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
});

MicrosoftTeamsIntegrationSchema.virtual("isIntegrated").get(function () {
  return this.accessToken ? true : false;
});

MicrosoftTeamsIntegrationSchema.set('toJSON', { getters: true });

export const MicrosoftTeamsIntegrationsModel = mongoose.model<MicrosoftTeamsIntegration>("microsoftTeamsIntegrations", MicrosoftTeamsIntegrationSchema, "microsoftTeamsIntegrations");