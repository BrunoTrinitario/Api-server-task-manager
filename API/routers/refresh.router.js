import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getToken, getUsernameFromToken, tokenGenerator, verifyToken } from "../controller/tokencontroller.js";
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
  try {
    const token = getToken(req);
    verifyToken(token);
    const username = getUsernameFromToken(token)
    const newAccessToken = tokenGenerator(username, 3600);
    const tokens = {
      accessToken: newAccessToken,
      refreshToken: token,
    };
    res.status(200).json(tokens);
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
    return res.end();
  }
});

export default router;
