import { MESSAGES } from "../constants.js";
import {
  delTodo,
  getTodoList,
  getTodoById,
  newTodo,
  modTodo,
  notDelTodo,
} from "./mariadbcontroller.js";

import { userPermission, getListByID } from "./listscontroller.js";
import { controllerError } from "../classes/controllerError.js";

/**
 * @brief
 * Calls the database controller to get all the todos from a list
 * @param username: Username of the contributor or adminstrator
 * @param id_list: Identificator of the list
 * @return An array of todo objects
 * @throws controllerError: If the user doesnt have permission
 * @throws controllerError: If the list wasnt found
 */
export async function getAlltodo(username, id_list) {
  const list = await getListByID(id_list);
  if (list) {
    const perm = await userPermission(username, id_list);
    if (perm == "R" || perm == "RW") {
      const todos = await getTodoList(id_list);
      return todos;
    } else {
      throw new controllerError(MESSAGES.NOT_PERMITTED, 403);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Calls the database controller to create one todo into a list
 * @param username: Username of the contributor or administrator
 * @param id_list: Identificator of the list
 * @param text: The text thats gonna be in the todo
 * @return -
 * @throws controllerError: If the user doesnt have permission
 * @throws controllerError: If the list wasnt found
 */
export async function createTodo(username, id_list, text) {
  const list = await getListByID(id_list);
  if (list) {
    const perm = await userPermission(username, id_list);
    if (perm == "RW") {
      await newTodo(id_list, text);
    } else {
      throw new controllerError(MESSAGES.NOT_PERMITTED, 403);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Calls the database controller to change the text of one todo in a list
 * @param username: Username of the contributor or administrator
 * @param id_list: Identificator of the list
 * @param id_todo: Identificator of the todo inside a list
 * @param newText: The new text thats gonna be in the todo
 * @return -
 * @throws controllerError: If the user doesnt have permission
 * @throws controllerError: If the list wasnt found
 * @throws controllerError: If the todo wasnt found
 */
export async function patchTodo(username, id_list, id_todo, newText) {
  const list = await getListByID(id_list);
  if (list) {
    const todo = await getOneTODObyID(id_list, id_todo);
    if (todo) {
      const perm = await userPermission(username, id_list);
      if (perm == "RW") {
        await modTodo(id_list, id_todo, newText);
      } else {
        throw new controllerError(MESSAGES.NOT_PERMITTED, 403);
      }
    } else {
      throw new controllerError(MESSAGES.TODO_NOT_FOUND, 404);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Calls the database controller to delete one todo from a list, the result of the method
 * relies in the action, could be "delete" to mark the todo as "deleted" or if the todo
 * was marked, deleted permanently form the database. Another action its "not_deleted" that takes
 * away the "deleted" mark if the todo wasnt deleted from the database yet
 * @param username: Username of the contributor or administrator
 * @param id_list: Identificator of the list
 * @param id_todo: Identificator of the todo inside a list
 * @param action: The action to perform into the todo
 * @return -
 * @throws controllerError: If the action doesnt exists
 * @throws controllerError: If the user doesnt have permission
 * @throws controllerError: If the list wasnt found
 * @throws controllerError: If the todo wasnt found
 */
export async function deleteTodo(username, id_list, id_todo, action) {
  const list = await getListByID(id_list);
  if (list) {
    const todo = await getOneTODObyID(id_list, id_todo);
    if (todo) {
      const perm = await userPermission(username, id_list);
      if (perm == "RW") {
        switch (action) {
          case "delete":
            await delTodo(id_list, id_todo);
            break;
          case "not_delete":
            await notDelTodo(id_list, id_todo);
            break;
          default:
            throw new controllerError(MESSAGES.INV_ACCTION, 405);
            break;
        }
      } else {
        throw new controllerError(MESSAGES.NOT_PERMITTED, 403);
      }
    } else {
      throw new controllerError(MESSAGES.TODO_NOT_FOUND, 404);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Calls the database to get a the todos by the id
 * @param id_list: Identificator of the list
 * @param id_todo: Identificator of the todo inside a list
 * @return undefinde or the todo object
 */
export async function getOneTODObyID(id_todo, id_list) {
  const todo = await getTodoById(id_list, id_todo);
  if (todo.length != 0) {
    return todo[0];
  } else return undefined;
}
