import express from "express";
import {
  isRegistered,
  registerUser,
  patchUser,
  deleteUser,
} from "../controller/userscontroller.js";
import { MESSAGES } from "../constants.js";
const router = express.Router();

function getUserPas(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw new Error("no authorization data");
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
// el /login GET va a tener en el header el user y contra
router.get("/", async (req, res) => {
  setResHeadres(res);
  try {
    const user = getUserPas(req)[0];
    const pass = getUserPas(req)[1];
    await isRegistered(user, pass, res);
    return res.end();
  } catch (e) {
    res.writeHead(400, MESSAGES.NOT_HEAD_AUTH);
    return res.end();
  }
});

router.post("/", (req, res) => {
  setResHeadres(res);
  try {
    const newUser = req?.body;
    if (newUser?.username && newUser?.password) {
      return registerUser(newUser.username, newUser.password, res);
    } else {
      res.writeHead(400, MESSAGES.INVALID_REG_DATA);
      return res.end();
    }
  } catch (e) {
    res.writeHead(400, MESSAGES.INVALID_REG_DATA);
    return res.end();
  }
});

router.patch("/", (req, res) => {
  setResHeadres(res);
  try {
    const newUser = req?.body;
    if (newUser?.username && newUser?.password && newUser?.newpassword) {
      return patchUser(
        newUser.username,
        newUser.password,
        newUser.newpassword,
        res
      );
    } else {
      res.writeHead(400, MESSAGES.INVALID_PATCH_DATA);
      return res.end();
    }
  } catch (e) {}
});

router.delete("/", (req, res) => {
  setResHeadres(res);
  const user = req?.body;
  if (user?.username && user?.password) {
    deleteUser(user.username, user.password, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_DELETE_DATA);
    return res.end();
  }
});

router.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

export default router;
