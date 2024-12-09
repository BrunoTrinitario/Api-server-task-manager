import { MESSAGES } from "../constants.js";
import {
  delTodo,
  getList,
  getPermission,
  getTodoList,
  getTodoID,
  getUser,
  newTodo,
  modTodo,
  notDelTodo,
} from "./mariadbcontroller.js";

import { userPermission } from "./listscontroller.js";

export async function getAlltodo(id_list, res) {
  const list = await getList(id_list);
  if (list.length != 0) {
    const todos = await getTodoList(id_list);
    return todos;
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
    return res.end();
  }
}

export async function createTodo(username, id_list, text, res) {
  const list = await getList(id_list);
  if (list.length != 0) {
    if (await isPermitted(username, id_list)) {
      await newTodo(id_list, text);
      res.writeHead(200, "");
    } else {
      res.writeHead(400, MESSAGES.NOT_PERMITTED);
      res.end();
    }
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
  }
  return res.end();
}

export async function patchTodo(username, id_list, id_todo, newText, res) {
  const list = await getList(id_list);
  if (list.length != 0) {
    const todo = await getTodoID(id_list, id_todo);
    if (todo.length != 0) {
      if (await isPermitted(username, id_list)) {
        await modTodo(id_list, id_todo, newText);
        res.writeHead(200, "");
      } else {
        res.writeHead(400, MESSAGES.NOT_PERMITTED);
      }
    } else {
      res.writeHead(400, MESSAGES.TODO_NOT_FOUND);
    }
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
  }
  return res.end();
}

export async function deleteTodo(username, id_list, id_todo, acction, res) {
  const list = await getList(id_list);
  if (list.length != 0) {
    const todo = await getTodoID(id_list, id_todo);
    if (todo.length != 0) {
      if (await isPermitted(username, id_list)) {
        switch (acction) {
          case "delete":
            await delTodo(id_list, id_todo);
            res.writeHead(200, "");
            break;
          case "not_delete":
            await notDelTodo(id_list, id_todo);
            res.writeHead(200, "");
            break;
          default:
            res.writeHead(400, MESSAGES.INV_ACCTION);
            break;
        }
      } else {
        res.writeHead(400, MESSAGES.NOT_PERMITTED);
      }
    } else {
      res.writeHead(400, MESSAGES.TODO_NOT_FOUND);
    }
  } else {
    res.writeHead(400, MESSAGES.LIST_NOT_FOUND);
  }
  return res.end();
}

async function isPermitted(username, id_list) {
  const permission = await userPermission(username, id_list);
  if (permission == "RW") return true;
  else return false;
}
