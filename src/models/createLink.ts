import mongoose from "mongoose";

const Schema = mongoose.Schema;

//Creating a schema instance
const linkSchema = new Schema({
  link: {
    type: String,
  },
  path: {
    type: String,
  },
  randomAlpha: {
    type: String,
    unique: true,
  },
  lastVisit: {
    type: Number,
  },
  createdOn: {
    type: Number,
  },
  expiresOn: {
    type: Number,
  },
});

const LinkModal = mongoose.model("konnectLinks", linkSchema);

export default LinkModal;
