import express from "express";
import { MESSAGES, PATHS } from "../constants.js";
import {
  createList,
  deleteList,
  getListByUSER,
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

router.use(PATHS.contributorsPath, contributorsRouter);
router.use(PATHS.todoPath, todoRouter);

router.get("/:username", async (req, res) => {
  setResHeadres(res);
  const username = req.params.username;
  if (username) {
    const listas = await getListByUSER(username);
    return res.status(200).json(listas);
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

router.patch("/:id_list", (req, res) => {
  setResHeadres(res);
  const newData = req?.body;
  const id_list = req.params.id_list;
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

router.delete("/:id_list", (req, res) => {
  setResHeadres(res);
  const id_list = req.params.id_list;
  const username = req?.body?.username;
  if (id_list != "" && username) {
    return deleteList(username, id_list, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_DELETE_DATA);
    return res.end();
  }
});

router.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

export default router;
