import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MESSAGES } from "../constants.js";
dotenv.config();
const router = express.Router();
const SECRET = process.env.SECRET;
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
  const refreshToken = req.headers["authorization"]?.split(" ")[1];
  if (!refreshToken) {
    res.writeHead(400, MESSAGES.INV_TOK);
    return res.end();
  }
  try {
    const decoded = jwt.verify(refreshToken, SECRET);
    const newAccessToken = tokenGenerator(decoded.username, 3600);
    const tokens = {
      accessToken: newAccessToken,
      refreshToken: refreshToken,
    };
    res.status(200).json(tokens);
  } catch (e) {
    res.writeHead(401, e.message);
    return res.end();
  }
});

function tokenGenerator(username, seconds) {
  const data = {
    username,
    exp: Math.floor(Date.now() / 1000) + seconds,
  };
  return jwt.sign(data, SECRET);
}

export default router;
