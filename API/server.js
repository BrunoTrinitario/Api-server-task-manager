import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MESSAGES, PATHS } from "./constants.js";
import userRouter from "./routers/users.router.js";
import listRouter from "./routers/list.router.js";
import refreshRouter from "./routers/refresh.router.js";
import bp from "body-parser";
import cors from "cors";
dotenv.config();
const app = express({ mergeParams: true });
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

/*
bp.json(): Body parser to json
cors(): The module to allow connections with browsers.
PATHS.usersPath: Path to access user entity module.
PATHS.listsPath: Path to access list entity module.
PATHS.refreshPath: Path to access refresh token module.
*/
app.use(bp.json());
app.use(cors());
app.use(PATHS.usersPath, userRouter);
app.use(PATHS.refreshPath, refreshRouter);

//validates access token
app.use((req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).send(MESSAGES.INV_TOK);
  }
  try {
    jwt.verify(token, SECRET);
    next();
  } catch (e) {
    res.status(403).send(e.message);
  }
});

app.use(PATHS.listsPath, listRouter);
app.use((req, res) => {
  res.status(404).send("Page not found root");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
