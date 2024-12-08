import { MESSAGES } from "../constants.js";
import {
  delList,
  getList,
  getUser,
  modList,
  newList,
  getListUser,
  getPermission,
} from "./mariadbcontroller.js";

export async function userPermission(username, id_list) {
  let ID_user = await getUser(username);
  if (ID_user.length != 0) {
    ID_user = ID_user[0].id_user;
    return await getPermission(ID_user, id_list);
  } else {
    return false;
  }
}

export async function createList(username, name, res) {
  const user = await getUser(username);
  if (user.length != 0) {
    await newList(username, name);
    res.writeHead(200, "");
  } else {
    res.writeHead(400, MESSAGES.USR_NOT_FOUND);
  }
  return res.end();
}

export async function patchList(username, id, newName, res) {
  const lista = await getList(id);
  if (lista.length != 0) {
    const permission = await userPermission(username, id);
    if (permission == "RW") {
      await modList(id, newName);
      res.writeHead(200, "");
    } else {
      res.writeHead(400, MESSAGES.NOT_PERMITTED);
    }
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
  }
  return res.end();
}

export async function getListByID(id) {
  const lista = await getList(id);
  if (lista.length != 0) {
    return lista;
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
    return res.end();
  }
}

export async function getListByUSER(username) {
  const lists = await getListUser(username);
  return lists;
}

export async function deleteList(username, id, res) {
  const lista = await getList(id);
  if (lista.length != 0) {
    const permission = await userPermission(username, id);
    if (permission == "RW") {
      await delList(id);
      res.writeHead(200, "");
    } else {
      res.writeHead(400, MESSAGES.NOT_PERMITTED);
    }
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
  }
  return res.end();
}
