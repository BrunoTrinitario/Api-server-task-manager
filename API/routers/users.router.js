import express from "express";
import {
  isRegistered,
  registerUser,
  patchUser,
  deleteUser
} from "../controller/userscontroller.js";
import { MESSAGES } from "../constants.js";
import { controllerError } from "../classes/controllerError.js";
import { tokenGenerator } from "../controller/tokencontroller.js";
const router = express.Router();

function getUserPas(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw new controllerError(MESSAGES.NOT_AUTH, 400);
  }
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64")
    .toString("ascii")
    .split(":");
  return credentials;
}

function setResHeadres(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Content-Type",
    "text/event-stream",
    "Cache-Control",
    "no-cache",
    "Connection",
    "keep-alive"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

router.get("/", async (req, res) => {
  setResHeadres(res);
  try {
    const user = getUserPas(req)[0];
    const pass = getUserPas(req)[1];
    const id_user = await isRegistered(user, pass);
    const acc_token = tokenGenerator(user, 3600);
    const ref_token = tokenGenerator(user, 18000);
    return res.status(200).json({ id_user, acc_token, ref_token });
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
    return res.end();
  }
});

router.post("/", async (req, res) => {
  setResHeadres(res);
  const newUser = req?.body;
  try {
    if (newUser?.username && newUser?.password) {
      await registerUser(newUser.username, newUser.password, res);
      res.writeHead(200, MESSAGES.SUC_REG);
    } else {
      res.writeHead(400, MESSAGES.INVALID_REG_DATA);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.patch("/", async (req, res) => {
  setResHeadres(res);
  try {
    const newUser = req?.body;
    if (newUser?.username && newUser?.password && newUser?.newpassword) {
      await patchUser(newUser.username, newUser.password, newUser.newpassword);
      res.writeHead(200, MESSAGES.SUC_PATCH);
    } else {
      res.writeHead(400, MESSAGES.INVALID_PATCH_DATA);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.delete("/", async (req, res) => {
  setResHeadres(res);
  try {
    const user = req?.body;
    if (user?.username && user?.password) {
      await deleteUser(user.username, user.password);
      res.writeHead(200, MESSAGES.SUC_DEL);
    } else {
      res.writeHead(400, MESSAGES.INVALID_DELETE_DATA);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.use((req, res) => {
  res.status(404).send("Page not found");
});

export default router;
