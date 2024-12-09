import { MESSAGES } from "../constants.js";
import crypto from "crypto";
import {
  delList,
  getList,
  getUser,
  modList,
  newList,
  getListUser,
  getPermission,
  getAllContributors,
  delContributor,
  getIdFromUser,
  newContributor,
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

export async function getContributors(id_list, res) {
  const lista = await getList(id_list);
  if (lista.length != 0) {
    return await getAllContributors(id_list);
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
    res.end();
    return false;
  }
}

export async function deleteContributors(
  id_admin,
  id_list,
  user_contributor,
  res
) {
  const list = await getList(id_list);
  if (list.length != 0) {
    const admin = list[0].id_administrator;
    if (admin == id_admin) {
      res.writeHead(200, "");
      await delContributor(id_list, user_contributor);
    } else {
      res.writeHead(400, MESSAGES.NOT_PERMITTED);
    }
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
  }
  return res.end();
}

export async function generateLink(id_administrator, id_list, permission, res) {
  const list = await getList(id_list);
  if (list.length != 0) {
    if (list[0].id_administrator == id_administrator) {
      const random_number = crypto.randomBytes(4).toString("hex"); // Generar un número aleatorio (hex)
      const expirationTime = 5 * 60 * 1000; // Duración del link (5 minutos)
      const fullLink = `/${id_list}/contributors/${random_number}`;
      return {
        link: fullLink,
        number: random_number,
        exp_date: Date.now() + expirationTime,
        permission: permission,
      };
    } else {
      res.writeHead(400, MESSAGES.NOT_PERMITTED);
      return false;
    }
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
    return false;
  }
}

export async function registerContributor(id_list, permission, username, res) {
  const list = await getList(id_list);
  if (list.length != 0) {
    const id_user = await getIdFromUser(username);
    if (id_user) {
      await newContributor(id_list, id_user, permission);
      res.writeHead(200, "");
    } else {
      res.writeHead(400, MESSAGES.USR_NOT_FOUND);
    }
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
  }
  return res.end();
}
