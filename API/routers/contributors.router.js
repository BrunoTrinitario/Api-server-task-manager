import express from "express";
import {
  deleteContributors,
  generateLink,
  getContributors,
  registerContributor,
} from "../controller/contributorscontroller.js";
import { MESSAGES } from "../constants.js";
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
const random_link = new Map();

router.get("/", async (req, res) => {
  setResHeadres(res);
  const id_list = req?.params?.id_list;
  try {
    const token=getToken(req);
    const username = getUsernameFromToken(token);
    const contributors = await getContributors(username,id_list);
    return res.status(200).json(contributors);
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
    return res.end();
  }
});

router.post("/generate-link", async (req, res) => {
  setResHeadres(res);
  const id_list = req.params.id_list;
  try {
    const permission = req?.body?.permission;
    const token=getToken(req);
    const user_admin = getUsernameFromToken(token);
    if (permission && id_list && user_admin && (permission == "R" || permission == "RW")) {
      const data = await generateLink(user_admin, id_list, permission);
      random_link.set(data.number, data);
      const link = `http://${req.get("host")}/list` + data.link;
      res.status(200).json({ link });
    } else {
      res.writeHead(400, MESSAGES.INV_LINK);
      return res.end();
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
    return res.end();
  }
});

router.post("/:random_number", async (req, res) => {
  const random_number = req?.params?.random_number;
  try {
    if (random_link.has(random_number)) {
      const data = random_link.get(random_number);
      const expired = data.exp_date - Date.now();
      if (expired > 0) {
        const token=getToken(req);
        const username = getUsernameFromToken(token);
        if (username) {
          const id_list = req?.params?.id_list;
          await registerContributor(id_list, data.permission, username);
          res.writeHead(200, MESSAGES.SUC_REG);
        } else {
          res.writeHead(400, MESSAGES.INV_USR);
        }
      } else {
        res.writeHead(410, MESSAGES.LINK_EXP);
        random_link.delete(random_number);
      }
    } else {
      res.writeHead(404, MESSAGES.RND_LINK_NOT_FOUND);
    }
  } catch (e) {
    res.writeHead(e.statusCode, e.message);
  }
  return res.end();
});

router.delete("/", async (req, res) => {
  setResHeadres(res);
  const id_list = req?.params?.id_list;
  try {
    const token=getToken(req);
    const user_admin = getUsernameFromToken(token);
    const user_contributor = req?.body?.contributor;
    if (id_list && user_admin && user_contributor) {
      await deleteContributors(user_admin, id_list, user_contributor);
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
  res.status(404).send("Page not found contributor");
});

export default router;
