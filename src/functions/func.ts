import mongoose from "mongoose";
import LinkModal from "../models/createLink";
import randomstring from "randomstring";
import { mongodbConnectionString } from "../ignore";

export const checkIfLinkAlreadyExist = async (link: string) => {
  console.log(link);
  const doesLinkExist = await LinkModal.findOne({ link }).then((res) => {
    console.log(res);
  });
  //console.log(doesLinkExist);
  return doesLinkExist;
};

export const generateNewLink = async () => {
  const uniqueString = randomstring.generate({
    length: 10,
    charset: "alphabetic",
  });

  return uniqueString;
};

export const generateNewLinkTwo = async () => {
  const uniqueString = randomstring.generate({
    length: 10,
    charset: "alphabetic",
  });

  return uniqueString;
};

export const checkIfRandomStringAlreadyExists = async (
  randomLetter: string
) => {
  const existOne = await LinkModal.findOne({ randomAlpha: randomLetter });
  return existOne;
};

export const connectDB = async (
  req: Express.Request,
  res: Express.Response,
  next: any
) => {
  try {
    mongoose.Promise = Promise;
    mongoose
      .connect(mongodbConnectionString)
      .then(() => console.log("Connected"));
    mongoose.connection.on("error", (error: Error) => {
      console.log(error.message);
    });
    next();
  } catch (error) {
    // @ts-ignore
    res.status(500).json({ message: "Internal server error" });
  }
};
