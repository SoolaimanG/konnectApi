import express from "express";
import {
  createCustomLink,
  deleteLink,
  generateURL,
  getGeneratedUrl,
  getUserLink,
  linkGetRequest,
  linkPostRequest,
} from "../controller/control";

const route = express.Router();
//Reggex to match the url pattern

//Making a post request
route.post("/shorten-link", linkPostRequest);

//Making a GET request
route.get("/:link", linkGetRequest);

route.post("/generate-url", generateURL);

route.get("/k/:path", getGeneratedUrl);

route.get("/get-all-user-link/:username", getUserLink);

route.post("/create-custom-link", createCustomLink);

route.delete("/delete-link/:id", deleteLink);

export default (): express.Router => {
  return route;
};
