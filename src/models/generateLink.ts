import mongoose from "mongoose";

const Schema = mongoose.Schema;

const GenerateLink = new Schema({
  link: {
    type: String,
  },
  path: {
    type: String,
  },
  createdOn: {
    type: Number,
  },
  views: {
    type: Number,
  },
  domain: {
    type: String,
  },
  randomString: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  is_custom: Boolean,
});

export const GenerateLinkModel =
  mongoose.models.generatedlinks ??
  mongoose.model("generatedlinks", GenerateLink);
