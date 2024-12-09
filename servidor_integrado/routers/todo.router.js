import express from "express";
import { MESSAGES } from "../constants.js";
import {
  createTodo,
  deleteTodo,
  getAlltodo,
  patchTodo,
} from "../controller/todocontroller.js";
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

router.get("/:username", async (req, res) => {
  setResHeadres(res);
  const username = req.params.username;
  const id_list = req.params.id_list;
  if (username && id_list && username != "") {
    const todo = await getAlltodo(id_list, res);
    return res.status(200).json(todo);
  } else {
    res.writeHead(400, MESSAGES.INV_USR);
    return res.end();
  }
});

router.post("/", async (req, res) => {
  setResHeadres(res);
  const newTodo = req?.body;
  const id_list = req.params.id_list;
  if (newTodo?.text && newTodo?.username && id_list != "") {
    return await createTodo(newTodo.username, id_list, newTodo.text, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_TODO_DATA);
    return res.end();
  }
});

router.patch("/:id_todo", async (req, res) => {
  setResHeadres(res);
  const newData = req?.body;
  const id_list = req.params.id_list;
  const id_todo = req.params.id_todo;
  if (id_list && id_todo) {
    if (newData?.username && newData?.text && newData?.text != "") {
      await patchTodo(newData.username, id_list, id_todo, newData.text, res);
    } else {
      res.writeHead(400, MESSAGES.INVALID_PATCH_DATA);
      return res.end();
    }
  } else {
    res.writeHead(400, MESSAGES.INVALID_PATCH_DATA);
    return res.end();
  }
});

router.delete("/:id_todo", async (req, res) => {
  setResHeadres(res);
  const id_list = req.params.id_list;
  const id_todo = req.params.id_todo;
  const username = req?.body?.username;
  const acction = req?.body?.acction;
  if (id_list && id_todo && username && acction) {
    return await deleteTodo(username, id_list, id_todo, acction, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_DELETE_DATA);
    return res.end();
  }
});

export default router;
