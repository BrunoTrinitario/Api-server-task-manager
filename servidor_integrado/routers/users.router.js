import express from "express";
import "dotenv/config";
const app = express();
const PORT = process.env.PORT_SSE;
export let clients = [];

const router = express.Router();

// TODO, conectarse a una mongoDB, para crear, modificar y/o eliminar un usuario

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

router.get("/", (req, res) => {
  setResHeadres(res);
});

router.post("/", (req, res) => {
  setResHeadres(res);
});

router.patch("/", (req, res) => {
  setResHeadres(res);
});

router.delete("/", (req, res) => {
  setResHeadres(res);
});

export default router;
