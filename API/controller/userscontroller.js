import { controllerError } from "../classes/controllerError.js";
import { MESSAGES } from "../constants.js";
import jwt from "jsonwebtoken";
import { getUser, regUser, modUser, delUser } from "./mariadbcontroller.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
const SECRET = process.env.SECRET;

/**
 * @brief
 * Calls the database get an user by the username
 * @param username: the username of the user to be obtain
 * @return undefined or the user objetct
 */
export async function getUserByUsername(username) {
  const vec = await getUser(username);
  if (vec.length == 0) {
    return undefined;
  } else return vec[0];
}

/**
 * @brief
 * Compare a not hashed password with a hashed password
 * @param realPass: Not hashed password
 * @param passToCompare: Hashed password
 * @return true or false
 */
async function passComp(realPass, passToCompare) {
  const comparator = await bcrypt.compare(realPass, passToCompare);
  if (comparator) {
    return true;
  } else {
    return false;
  }
}

/**
 * @brief
 * Checks if the user its registered
 * @param username: The username of the user
 * @param pass: Not hashed password
 * @return The user identificator
 * @throws controllerError: If the password its invalid
 * @throws controllerError: If the user wasnt found
 */
export async function isRegistered(username, pass) {
  const us = await getUserByUsername(username);
  if (us) {
    const comparator = await passComp(pass, us._password);
    if (comparator) {
      return us.id_user;
    } else {
      throw new controllerError(MESSAGES.INV_PASS, 401);
    }
  } else {
    throw new controllerError(MESSAGES.USR_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Regists an user hashing the password and calling the database controller to register it
 * @param username: The username of the user to be registered
 * @param pass: The password
 * @return -
 * @throws controllerError: If the username its taken
 */
export async function registerUser(username, pass) {
  const us = await getUserByUsername(username);
  if (!us) {
    const hashedPass = await bcrypt.hash(pass, 1);
    await regUser(username, hashedPass);
  } else {
    throw new controllerError(MESSAGES.EXIST_US, 409);
  }
}

/**
 * @brief
 * Change the password of an user by calling the database controller
 * @param username: The username of the user to be modified
 * @param pass: Not hashed password
 * @param newpass: Not hashed new password
 * @return -
 * @throws controllerError: If the password its incorrect
 * @throws controllerError: If the user wasnt found
 */
export async function patchUser(username, pass, newpass) {
  const us = await getUserByUsername(username);
  if (us) {
    const comparator = await passComp(pass, us._password);
    if (comparator) {
      const hashedPass = await bcrypt.hash(newpass, 1);
      await modUser(username, hashedPass);
    } else {
      throw new controllerError(MESSAGES.INV_CRED, 400);
    }
  } else {
    throw new controllerError(MESSAGES.USR_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Deletes an user by calling the database controller
 * @param username: The username of the user to be deleted
 * @param pass: Not hashed password
 * @return -
 * @throws controllerError: If the password its incorrect
 * @throws controllerError: If the user wasnt found
 */
export async function deleteUser(username, pass) {
  const us = await getUserByUsername(username);
  if (us) {
    const comparator = await passComp(pass, us._password);
    if (comparator) {
      await delUser(username);
    } else {
      throw new controllerError(MESSAGES.INV_CRED, 400);
    }
  } else {
    throw new controllerError(MESSAGES.USR_NOT_FOUND, 404);
  }
}

/**
 * @brief
 * Generates a json web token
 * @param username: The username of the user
 * @param seconds: time to live of jwt
 * @return the jason web token
 */
export function tokenGenerator(username, seconds) {
  const data = {
    username,
    exp: Math.floor(Date.now() / 1000) + seconds,
  };
  return jwt.sign(data, SECRET);
}
