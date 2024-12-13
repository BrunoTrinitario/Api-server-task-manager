import { getListByID } from "./listscontroller.js";
import { MESSAGES } from "../constants.js";
import { controllerError } from "../classes/controllerError.js";
import {
  getAllContributors,
  delContributor,
  newContributor,
} from "./mariadbcontroller.js";
import crypto from "crypto";
import { getUserByUsername } from "./userscontroller.js";
/**
 * @brief
 * Calls the database to get an array of contributors of any list having the id
 * @param id_list: Identificator of the list
 * @return An empty array or the username and id of all the contributors of that list in each position
 * @throws controllerError: If the list wasnt found
 */
export async function getContributors(id_list) {
  const list = await getListByID(id_list);
  if (list) {
    return await getAllContributors(id_list);
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Calls the database to delete contributors of a list by the username
 * @param user_admin: Username of the administrator of the list
 * @param id_list: Identificator of the list
 * @param user_contributor: Username of the contributor
 * @return -
 * @throws controllerError: If the user isnt the administrator
 * @throws controllerError: If the list wasnt found
 */
export async function deleteContributors(
  user_admin,
  id_list,
  user_contributor
) {
  const list = await getListByID(id_list);
  let id_admin = await getUserByUsername(user_admin);
  id_admin = id_admin?.id_user;
  if (list) {
    if (list.id_administrator == id_admin) {
      await delContributor(id_list, user_contributor);
    } else {
      throw new controllerError(MESSAGES.NOT_PERMITTED, 403);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Generate a random link to add contributors
 * @param user_admin: Username of the administrator of the list
 * @param id_list: Identificator of the list
 * @param permission: Permission to get if the contributor uses the link
 * @return The link to grant the access to contributors
 * @throws controllerError: If the user isnt the administrator
 * @throws controllerError: If the list wasnt found
 */
export async function generateLink(user_admin, id_list, permission) {
  const list = await getListByID(id_list);
  let id_admin = await getUserByUsername(user_admin);
  id_admin = id_admin?.id_user;
  if (list) {
    if (list.id_administrator == id_admin) {
      const random_number = crypto.randomBytes(4).toString("hex");
      const expirationTime = 5 * 60 * 1000;
      const fullLink = `/${id_list}/contributors/${random_number}`;
      return {
        link: fullLink,
        number: random_number,
        exp_date: Date.now() + expirationTime,
        permission: permission,
      };
    } else {
      throw new controllerError(MESSAGES.NOT_PERMITTED, 403);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Calls the database to add contributors of a list by the username
 * @param id_list: Identificator of the list
 * @param permission: Permissions granted to the user
 * @param username: Username of the contributor to add
 * @return -
 * @throws controllerError: If the user wasnt found
 * @throws controllerError: If the list wasnt found
 */
export async function registerContributor(id_list, permission, username) {
  const list = await getListByID(id_list);
  if (list) {
    let id_user = await getUserByUsername(username);
    id_user = id_user?.id_user;
    if (id_user) {
      await newContributor(id_list, id_user, permission);
    } else {
      throw new controllerError(MESSAGES.USR_NOT_FOUND, 404);
    }
  } else {
    throw new controllerError(MESSAGES.LIST_NOT_FOUND, 404);
  }
}
