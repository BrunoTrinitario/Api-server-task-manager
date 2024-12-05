import { MESSAGES } from "../constants.js";
import { getUser, regUser, modUser, delUser } from "./mariadbcontroller.js";
import bcrypt from "bcrypt";

async function existUser(user) {
  const vec = await getUser(user);
  if (vec.length == 0) {
    return false;
  } else return vec[0];
}

async function passComp(realPass, pass) {
  const comparator = await bcrypt.compare(realPass, pass);
  if (comparator) {
    return true;
  } else {
    return false;
  }
}

export async function isRegistered(user, pass, res) {
  const us = await existUser(user);
  if (us) {
    const comparator = await passComp(pass, us._password);
    if (comparator) {
      res.writeHead(200, "");
      return true;
    } else {
      res.writeHead(400, MESSAGES.INV_PASS);
      return false;
    }
  } else {
    res.writeHead(400, MESSAGES.USR_NOT_FOUND);
    return false;
  }
}

export async function registerUser(user, pass, res) {
  const us = await existUser(user);
  if (!us) {
    const hashedPass = await bcrypt.hash(pass, 1);
    if (await regUser(user, hashedPass)) {
      res.writeHead(200, MESSAGES.SUC_REG);
      return res.end();
    } else {
      res.writeHead(400, MESSAGES.REG_BD_ERROR);
      return res.end();
    }
  } else {
    res.writeHead(400, MESSAGES.EXIST_US);
    return res.end();
  }
}

export async function patchUser(user, pass, newpass, res) {
  const us = await existUser(user);
  if (us) {
    const comparator = await passComp(pass, us._password);
    if (comparator) {
      const hashedPass = await bcrypt.hash(newpass, 1);
      if (await modUser(user, hashedPass)) {
        res.writeHead(200, "");
        return res.end();
      } else {
        res.writeHead(400, MESSAGES.MOD_BD_ERROR);
        return res.end();
      }
    } else {
      res.writeHead(401, MESSAGES.INV_CRED);
      return res.end();
    }
  } else {
    res.writeHead(400, MESSAGES.USR_NOT_FOUND);
    return res.end();
  }
}

export async function deleteUser(user, pass, res) {
  const us = await existUser(user);
  if (us) {
    const comparator = await passComp(pass, us._password);
    if (comparator) {
      if (await delUser(user)) {
        res.writeHead(200, "");
        return res.end();
      } else {
        res.writeHead(400, MESSAGES.DEL_BD_ERROR);
        return res.end();
      }
    } else {
      res.writeHead(401, MESSAGES.INV_CRED);
      return res.end();
    }
  } else {
    res.writeHead(400, MESSAGES.USR_NOT_FOUND);
    return res.end();
  }
}
