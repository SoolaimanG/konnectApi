import express from "express";
import LinkModal from "../models/createLink";
import {
  checkIfRandomStringAlreadyExists,
  generateNewLink,
} from "../functions/func";
import { v4 as uuidv4 } from "uuid";
import { GenerateLinkModel } from "../models/generateLink";
import randomstring from "randomstring";
import mongoose from "mongoose";

const URLPattern =
  /^(https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

//GET REQUEST
export const linkGetRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const pathName = req.params.link;

  //Using this to find the link
  const newURL = `http://localhost:${80}/${pathName}`;
  const timeStamp = Date.now();

  mongoose.connection;
  try {
    // Finding the link in the database
    const response = await LinkModal.findOne({ link: newURL });
    const id = response?.id;

    if ((response?.expiresOn as number) >= timeStamp) {
      return await LinkModal.findByIdAndDelete(id).then(() => {
        res.status(404).send("Link expires or does not exist");
      });
    }

    // If the link is found, redirect the user to the original URL
    if (response && response.path) {
      res.status(302).redirect(response.path);
      await LinkModal.findByIdAndUpdate(id, { lastVisit: timeStamp });
    } else {
      res.status(404).send("Link not found");
    }
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server Error",
    });
  }
};

export const linkPostRequest = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { link } = req.body;

    mongoose.connection;
    const newGenerateURL = await generateNewLink();

    const stringExist = await checkIfRandomStringAlreadyExists(newGenerateURL);

    const uuid = uuidv4();
    const newURL = `http://localhost:${80}/${
      stringExist ? uuid.slice(0, uuid.length / 4) : newGenerateURL
    }`;

    const currentTime = Date.now();

    if (URLPattern.test(link)) {
      const expireNextTwentyDays =
        Number(currentTime) + 20 * 24 * 60 * 60 * 1000;

      const linkToDB = new LinkModal({
        link: newURL,
        randomAlpha: stringExist
          ? uuid.slice(0, uuid.length / 4)
          : newGenerateURL,
        expiresOn: expireNextTwentyDays,
        createdOn: currentTime,
        lastVisit: currentTime,
        path: link,
      });

      linkToDB
        .save()
        .then(() => {
          res.status(201).send(newURL);
        })
        .catch((err) => {
          console.error("Error saving to DB:", err);
          res.status(500).send({
            message: "Server error",
            statusCode: 500,
          });
        });
    } else {
      res.status(403).send("Invalid Parameter");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send({
      message: "Server error",
      statusCode: 500,
    });
  }
};

export const generateURL = async (
  req: express.Request,
  res: express.Response
) => {
  const { link, user } = req.body;

  if (!URLPattern.test(link)) {
    return res.status(409).send("Invalid URL");
  }

  const url = new URL(link);
  const domain = url.hostname;

  const UUID = uuidv4();

  let backupToken = UUID.length / 4;

  const token = randomstring.generate({
    length: 7,
    charset: "alphabetic",
  });

  mongoose.connection;

  const checktoken = await GenerateLinkModel.findOne({ randomString: token });

  const newPath = `http://localhost:80/k/${token}`;

  try {
    const generateURL = new GenerateLinkModel({
      link: link,
      path: newPath,
      createdOn: new Date(),
      views: 0,
      domain: domain,
      randomString: checktoken ? backupToken : token,
      createdBy: user,
      is_custom: false,
    });

    await generateURL.save();

    res.status(200).send({
      status: 200,
      newLink: newPath,
    });
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

export const getGeneratedUrl = async (
  req: express.Request,
  res: express.Response
) => {
  const token = req.params.path;

  mongoose.connection;

  const findURL = await GenerateLinkModel.findOne({ randomString: token });

  console.log(findURL);

  if (!findURL) {
    res.end("404 (lost)");
    return;
  }

  const update = { views: findURL.views + 1 };
  const filter = { randomString: token };
  try {
    await GenerateLinkModel.findOneAndUpdate(filter, update);

    res.status(302).redirect(findURL?.link);
  } catch (error) {
    res.end("Something went wrong");
  }
};

export const getUserLink = async (
  req: express.Request,
  res: express.Response
) => {
  const username = req.params.username;

  if (!username) {
    return res.status(400).send("User error");
  }

  mongoose.connection;

  try {
    //Get all the links from a specific user
    const allLinks = await GenerateLinkModel.find({
      createdBy: username,
    });

    if (allLinks.length > 0) {
      res.status(200).send(allLinks);
    } else {
      res.status(200).send({
        message: "No links found",
      });
    }
  } catch (error) {
    res.end("Something went wrong");
  }
};

export const createCustomLink = async (
  req: express.Request,
  res: express.Response
) => {
  const { customName, link, username } = req.body;

  console.log(customName, link, username);

  if (!URLPattern.test(link)) {
    return res.status(400).send("Invalid URL");
  }

  mongoose.connection;

  const findCustomName = await GenerateLinkModel.findOne({
    randomString: customName,
  });

  console.log(findCustomName);

  if (findCustomName) {
    return res.status(409).json({ message: "Custom name already exists" });
  }

  try {
    const url = new URL(link);
    const domain = url.hostname;

    const newPath = `http://localhost:80/k/${customName}`;

    const generateURL = new GenerateLinkModel({
      link: link,
      path: newPath,
      createdOn: new Date(),
      views: 0,
      domain: domain,
      randomString: customName,
      createdBy: username,
      is_custom: true,
    });

    await generateURL.save();

    res.status(200).send({
      status: 200,
      newLink: newPath,
    });
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

export const deleteLink = async (
  req: express.Request,
  res: express.Response
) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).send("Incorrect ID");
  }

  mongoose.connection;

  try {
    const deletedLink = await GenerateLinkModel.findByIdAndDelete(id);
    if (!deletedLink) {
      return res.status(404).send("Link not found");
    }

    res.status(200).send("Link deleted");
  } catch (error) {
    res.status(500).send(error);
  }
};
