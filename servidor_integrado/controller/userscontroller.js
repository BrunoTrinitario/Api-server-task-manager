import { MESSAGES } from "../constants.js";
import { getUser, regUser, modUser, delUser } from "./mongocontroller.js";
import bcrypt from "bcrypt";

async function matchUserPass(user, pass) {
  const us = await getUser(user);
  if (us?.password) {
    const comparator = await bcrypt.compare(pass, us.password);
    if (comparator) return true;
    else return false;
  } else return false;
}

export async function isRegistered(user, pass, res) {
  if (await matchUserPass(user, pass)) {
    res.writeHead(200, "");
    return true;
  } else {
    res.writeHead(400, MESSAGES.INV_CRED);
    return false;
  }
}

export async function registerUser(usuario, res) {
  const hashedPass = await bcrypt.hash(usuario.password, 1);
  const inserted = await regUser(usuario.username, hashedPass);
  if (inserted) {
    res.writeHead(200, MESSAGES.SUC_REG);
    return res.end();
  } else {
    res.writeHead(400, MESSAGES.EXIST_US);
    return res.end();
  }
}

export async function patchUser(usuario, res) {
  if (await matchUserPass(usuario.username, usuario.password)) {
    const hashedPass = await bcrypt.hash(usuario.newpassword, 1);
    await modUser(usuario.username, hashedPass);
    res.writeHead(200, "");
    return res.end();
  } else {
    res.writeHead(401, MESSAGES.INV_CRED);
    return res.end();
  }
}

export async function deleteUser(usuario, res) {
  if (await matchUserPass(usuario.username, usuario.password)) {
    delUser(usuario.username);
    res.writeHead(200, "");
    return res.end();
  } else {
    res.writeHead(401, MESSAGES.INV_CRED);
    return res.end();
  }
}
