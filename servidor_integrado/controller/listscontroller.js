import { MESSAGES } from "../constants.js";
import { controllerError } from "../clases/controllerError.js";
import crypto from "crypto";
import {
  delList,
  getListId,
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

/**
 * @brief
 * Calls the database controller to get the permission of an user in a list
 * @param username: The username of the user
 * @param id_list: Identificator of the list
 * @return permissions ("", "R", "RW")
 */
export async function userPermission(username, id_list) {
  let ID_user = await getUser(username);
  if (ID_user.length != 0) {
    ID_user = ID_user[0].id_user;
    return await getPermission(ID_user, id_list);
  } else {
    return "";
  }
}

/**
 * @brief
 * Calls the database controller to creates a list
 * @param username: The username of the user
 * @param name: The name of the list to be created
 * @return -
 * @throws controllerError: If the user doesnt exist
 */
export async function createList(username, name) {
  const user = await getUser(username);
  if (user.length != 0) {
    await newList(username, name);
  } else {
    throw new controllerError(MESSAGES.USR_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Calls the database controller to change the name of one list
 * @param username: The username of the user
 * @param id_list: Identificator of the list
 * @param newName: The new name for the list
 * @return -
 * @throws controllerError: If the user doenst have permission or the wasnt found
 */
export async function patchList(username, id_list, newName) {
  const list = await getListId(id_list);
  if (list) {
    const permission = await userPermission(username, id_list);
    if (permission == "RW") {
      await modList(id_list, newName);
    } else {
      throw new controllerError(MESSAGES.NOT_PERMITTED, 403);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Calls the database controller to get a list by the id
 * @param id_list: Identificator of the list
 * @return Undefined or the list as object
 */
export async function getListByID(id_list) {
  const list = await getListId(id_list);
  if (list.length != 0) {
    return list[0];
  } else return undefined;
}

/**
 * @brief
 * Calls the database controller to get a list by the username of the creator
 * @param username: Username of the creator
 * @return An empty array or a list for each position
 */
export async function getListsByUser(username) {
  const lists = await getListUser(username);
  return lists;
}

/**
 * @brief
 * Calls the database controller to delete a list by id checkin if the user has permissions
 * @param username: Username of the user
 * @param id_list: Identificator of the list
 * @return -
 * @throws controllerError: If the user doesnt have permission
 * @throws controllerError: If the list wasnt found
 */
export async function deleteList(username, id_list) {
  const list = await getListId(id_list);
  if (list != 0) {
    const permission = await userPermission(username, id_list);
    if (permission == "RW") {
      await delList(id_list);
    } else {
      throw new controllerError(MESSAGES.NOT_PERMITTED, 403);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}
