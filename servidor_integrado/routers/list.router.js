import express from "express";
import { MESSAGES } from "../constants.js";
import {
  createList,
  deleteList,
  getListByUSER,
  patchList,
  userPermission,
} from "../controller/listscontroller.js";
import {
  createTodo,
  deleteTodo,
  getAlltodo,
  patchTodo,
} from "../controller/todocontroller.js";
const router = express.Router();

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

//la idea seria que para obtener todas las listas del usuario sea url.../list/user
router.get("/:username", async (req, res) => {
  setResHeadres(res);
  const username = req.url.replace(/\//g, "");
  if (username) {
    const listas = await getListByUSER(username);
    return res.status(200).json(JSON.stringify(listas));
  } else {
    res.writeHead(400, MESSAGES.INV_USR);
    return res.end();
  }
});

//para obtener todos los todo de esa lista es url.../list/username/id
router.get("/:username/:id_list", async (req, res) => {
  setResHeadres(res);
  const data = req.url.split("/");
  const username = data[1];
  const id = data[2];
  if (username && id && username != "") {
    return await getAlltodo(id, res);
  } else {
    res.writeHead(400, MESSAGES.INV_USR);
    return res.end();
  }
});

router.post("/", async (req, res) => {
  setResHeadres(res);
  const newList = req?.body;
  if (newList?.creator && newList?.name && newList?.name != "") {
    return await createList(newList.creator, newList.name, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_LIST_DATA);
    return res.end();
  }
});

router.post("/:id_list", async (req, res) => {
  setResHeadres(res);
  const newTodo = req?.body;
  const id_list = req.url.replace(/\//g, "");
  if (newTodo?.text && newTodo?.username && id_list != "") {
    return await createTodo(newTodo.username, id_list, newTodo.text, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_TODO_DATA);
    return res.end();
  }
});

router.patch("/:id_list", (req, res) => {
  setResHeadres(res);
  const newData = req?.body;
  const id_list = req.url.replace(/\//g, "");
  if (
    newData?.username &&
    newData?.newName &&
    newData?.newName != "" &&
    id_list
  ) {
    return patchList(newData.username, id_list, newData.newName, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_PATCH_DATA);
    return res.end();
  }
});

router.patch("/:id_list/:id_todo", async (req, res) => {
  setResHeadres(res);
  const newData = req?.body;
  const data = req.url.split("/");
  const id_list = data[1];
  const id_todo = data[2];
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

router.delete("/:id_list", (req, res) => {
  setResHeadres(res);
  const id_list = req.url.replace(/\//g, "");
  const username = req?.body?.username;
  if (id_list != "" && username) {
    return deleteList(username, id_list, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_DELETE_DATA);
    return res.end();
  }
});

router.delete("/:id_list/:id_todo", async (req, res) => {
  setResHeadres(res);
  const data = req.url.split("/");
  const id_list = data[1];
  const id_todo = data[2];
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
