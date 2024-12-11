import express from "express";
import { MESSAGES, PATHS } from "../constants.js";
import {
  createList,
  deleteList,
  getListsByUser,
  patchList,
} from "../controller/listscontroller.js";
import contributorsRouter from "./contributors.router.js";
import todoRouter from "./todo.router.js";
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
  if (username) {
    const listas = await getListsByUser(username);
    return res.status(200).json(listas);
  } else {
    res.writeHead(400, MESSAGES.INV_USR);
    return res.end();
  }
});

router.post("/", async (req, res) => {
  setResHeadres(res);
  const newList = req?.body;
  try {
    if (newList?.username && newList?.name && newList?.name != "") {
      await createList(newList.username, newList.name);
      res.writeHead(200, MESSAGES.SUC_REG);
    } else {
      res.writeHead(400, MESSAGES.INVALID_LIST_DATA);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.patch("/:id_list", async (req, res) => {
  setResHeadres(res);
  try {
    const newData = req?.body;
    const id_list = req.params.id_list;
    if (
      newData?.username &&
      newData?.newname &&
      newData?.newname != "" &&
      id_list
    ) {
      await patchList(newData.username, id_list, newData.newname);
      res.writeHead(200, MESSAGES.SUC_PATCH);
    } else {
      res.writeHead(400, MESSAGES.INVALID_PATCH_DATA);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.delete("/:id_list", async (req, res) => {
  setResHeadres(res);
  try {
    const id_list = req.params.id_list;
    const username = req?.body?.username;
    if (id_list != "" && username) {
      await deleteList(username, id_list, res);
      res.writeHead(200, MESSAGES.SUC_DEL);
    } else {
      res.writeHead(400, MESSAGES.INVALID_DELETE_DATA);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.use(PATHS.contributorsPath, contributorsRouter);
router.use(PATHS.todoPath, todoRouter);

router.use((req, res) => {
  res.status(404).send("Page not found list ");
});

export default router;
