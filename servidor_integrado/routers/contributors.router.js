import express from "express";
import {
  deleteContributors,
  generateLink,
  getContributors,
  registerContributor,
} from "../controller/listscontroller.js";
import { MESSAGES } from "../constants.js";
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
const random_link = new Map();

router.get("/", async (req, res) => {
  setResHeadres(res);
  const id_list = req?.params?.id_list;
  if (id_list) {
    const contributors = await getContributors(id_list, res);
    if (contributors) return res.status(200).json(contributors);
    else {
      return contributors;
    }
  } else {
    res.writeHead(400, MESSAGES.INV_ID);
    return res.end();
  }
});

router.post("/generate-link", async (req, res) => {
  setResHeadres(res);
  const permission = req?.body?.permission;
  const id_administrator = req?.body?.id_administrator;
  const id_list = req.params.id_list;
  if (permission && id_list && id_administrator) {
    const data = await generateLink(id_administrator, id_list, permission, res);
    if (data) {
      random_link.set(data.number, data);
      const link = `http://${req.get("host")}/list` + data.link;
      res.status(200).json({ link });
    } else {
      return res.end();
    }
  } else {
    res.writeHead(400, MESSAGES.INV_LINK);
    return res.end();
  }
});

router.post("/:random_number", async (req, res) => {
  const username = req?.body?.username;
  const random_number = req?.params?.random_number;
  if (random_link.has(random_number)) {
    const data = random_link.get(random_number);
    const expired = data.exp_date - Date.now();
    if (expired > 0) {
      if (username) {
        const id_list = req?.params?.id_list;
        if (data.permission == "RW" || data.permission == "R") {
          await registerContributor(id_list, data.permission, username, res);
        } else {
          res.writeHead(400, MESSAGES.INV_PERM);
          return res.end();
        }
      } else {
        res.writeHead(400, MESSAGES.INV_USR);
        return res.end();
      }
    } else {
      res.writeHead(400, MESSAGES.LINK_EXP);
      random_link.delete(random_number);
      return res.end();
    }
  } else {
    res.writeHead(400, MESSAGES.RND_LINK_NOT_FOUND);
    return res.end();
  }
});

router.delete("/", async (req, res) => {
  setResHeadres(res);
  const id_list = req?.params?.id_list;
  const id_admin = req?.body?.id_administrator;
  const user_contributor = req?.body?.contributor;
  if (id_list && id_admin && user_contributor) {
    return await deleteContributors(id_admin, id_list, user_contributor, res);
  } else {
    res.writeHead(400, MESSAGES.INVALID_DELETE_DATA);
    return res.end();
  }
});

router.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

export default router;
