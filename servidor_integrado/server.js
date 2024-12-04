import express from "express";
import dotenv from "dotenv";
import { CONST } from "./constants.js";
import userRouter from "./routers/users.router.js";
import bp from "body-parser";
import cors from "cors";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(bp.json());
app.use(cors());
app.use(CONST.PATHS, userRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
