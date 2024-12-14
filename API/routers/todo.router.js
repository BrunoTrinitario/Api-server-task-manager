import express from "express";
import { MESSAGES } from "../constants.js";
import {
  createTodo,
  deleteTodo,
  getAlltodo,
  patchTodo,
} from "../controller/todocontroller.js";
import { getToken, getUsernameFromToken } from "../controller/tokencontroller.js";
const router = express.Router({ mergeParams: true });
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
  const id_list = req.params.id_list;
  try {
    const token=getToken(req);
    const username = getUsernameFromToken(token);
    if (username && id_list && username != "") {
      const todo = await getAlltodo(username, id_list);
      return res.status(200).json(todo);
    } else {
      res.writeHead(400, MESSAGES.INV_USR);
      return res.end();
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
    return res.end();
  }
});

router.post("/", async (req, res) => {
  setResHeadres(res);
  const id_list = req.params.id_list;
  try {
    const newTodo = req?.body;
    const token=getToken(req);
    const username = getUsernameFromToken(token);
    if (newTodo?.text && username && id_list != "") {
      await createTodo(username, id_list, newTodo.text);
      res.writeHead(200, MESSAGES.SUC_REG);
    } else {
      res.writeHead(400, MESSAGES.INVALID_TODO_DATA);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.patch("/:id_todo", async (req, res) => {
  setResHeadres(res);
  const id_list = req.params.id_list;
  const id_todo = req.params.id_todo;
  try {
    const newData = req?.body;
    const token=getToken(req);
    const username = getUsernameFromToken(token);
    if (
      id_list &&
      id_todo &&
      username &&
      newData?.newtext &&
      newData?.newtext != ""
    ) {
      await patchTodo(username, id_list, id_todo, newData.newtext);
      res.writeHead(200, MESSAGES.SUC_PATCH);
    } else {
      res.writeHead(400, MESSAGES.INVALID_PATCH_DATA);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.delete("/:id_todo", async (req, res) => {
  setResHeadres(res);
  const id_list = req.params.id_list;
  const id_todo = req.params.id_todo;
  try {
    const token=getToken(req);
    const username = getUsernameFromToken(token);
    const action = req?.body?.action;
    if (id_list && id_todo && username && action) {
      await deleteTodo(username, id_list, id_todo, action);
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
  res.status(404).send("Page not found todo");
});

export default router;
