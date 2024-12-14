import express from "express";
import dotenv from "dotenv";
import { PATHS } from "./constants.js";
import userRouter from "./routers/users.router.js";
import listRouter from "./routers/list.router.js";
import refreshRouter from "./routers/refresh.router.js";
import bp from "body-parser";
import cors from "cors";
import { getToken, verifyToken } from "./controller/tokencontroller.js";
dotenv.config();
const app = express({ mergeParams: true });
const PORT = process.env.PORT;


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
  try{
    const token=getToken(req);
    verifyToken(token);
    next();
  }catch(e){
    res.writeHeader(e.statusCode,e.message);
    return res.end();
  }
});

app.use(PATHS.listsPath, listRouter);
app.use((req, res) => {
  res.status(404).send("Page not found root");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
