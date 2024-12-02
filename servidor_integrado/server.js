import express from "express";
import dotenv from "dotenv";
import { CONST } from "./constants.js";
import { userRouter } from "./routers/users.router.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT;
//por lo visto le podemos poner el nmbre de export q quieramos al router, con app use,
//garatnizamos que cuando se le pege al sv con ese path, se ejecute ese script.
app.use(CONST.usersPath, userRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
