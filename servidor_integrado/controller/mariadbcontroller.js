import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { toFormData } from "axios";
dotenv.config();
const PORT = process.env.PORT_DB;
const IP = process.env.IP_DB;
const USER = process.env.USER_DB;
const PASS = process.env.PASS_DB;
const DB = process.env.DB_NAME;

const pool = mysql.createPool({
  host: IP,
  port: PORT,
  user: USER,
  password: PASS,
  database: DB,
});

async function executeQuery(query, params) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (err) {
    console.error("Error en la consulta:", err.message);
    return false;
  }
}

export async function getUser(user) {
  const aux1 = '"' + user + '"';
  const query = `SELECT * FROM users WHERE _user=${aux1}`;
  return await executeQuery(query, []);
}

export async function regUser(user, pass) {
  const aux1 = '"' + user + '"';
  const aux2 = '"' + pass + '"';
  const query = `INSERT INTO users (_user, _password) VALUES (${aux1}, ${aux2})`;
  return await executeQuery(query, []);
}

export async function modUser(user, pass) {
  const aux1 = '"' + user + '"';
  const aux2 = '"' + pass + '"';
  const query = `UPDATE users SET _password=${aux2} WHERE _user=${aux1}`;
  return await executeQuery(query, []);
}

export async function delUser(user) {
  const aux1 = '"' + user + '"';
  const query = `DELETE FROM users WHERE _user=${aux1}`;
  return await executeQuery(query, []);
}

export async function getList(id) {
  const query = `SELECT * FROM _list WHERE id_list=${id}`;
  return await executeQuery(query, []);
}

//al obtenerr una lista por nombre de usuario, tenemos las listas en la que
// somos administradores y contribuidores
export async function getListUser(username) {
  const aux1 = '"' + username + '"';
  let query = `SELECT l.* FROM _list l,users u WHERE l.id_administrator=u.id_user AND u._user=${aux1}`;
  const vec1 = await executeQuery(query, []);
  query = `SELECT l.* FROM _list l,users u,contributes c WHERE c.id_list=l.id_list AND c.id_user=u.id_user AND u._user=${aux1}`;
  const vec2 = await executeQuery(query, []);

  for (let i = 0; i < vec2.length; i++) {
    vec1.push(vec2[i]);
  }
  let combined = new Map();
  for (let i = 0; i < vec1.length; i++) {
    combined.set(vec1[i].id_list, vec1[i]);
  }
  const result = [];
  combined.forEach((key, value) => {
    result.push(key);
  });
  return result;
}

export async function newList(username, name) {
  const aux1 = '"' + username + '"';
  const aux2 = '"' + name + '"';
  let actualDate = new Date().toISOString().split("T")[0];
  actualDate = '"' + actualDate + '"';
  const query = `INSERT INTO _list (name,id_administrator,creation_date) VALUES (${aux2},(SELECT id_user FROM users WHERE _user =${aux1}),${actualDate})`;
  return await executeQuery(query, []);
}

export async function modList(id, newname) {
  const aux = '"' + newname + '"';
  const query = `UPDATE _list SET name=${aux} WHERE id_list=${id}`;
  return await executeQuery(query, []);
}

export async function delList(id) {
  //si se borra la lista, hay que eliminar todo lo que tenga que ver con ella
  const query = `DELETE FROM _list WHERE id_list=${id}`;
  return await executeQuery(query, []);
}

export async function getPermission(id_user, id_list) {
  let query = `SELECT * FROM _list WHERE id_administrator=${id_user} AND id_list=${id_list}`;
  let vec1 = await executeQuery(query, []);
  if (vec1.length != 0) return "RW";
  query = `SELECT * FROM contributes WHERE id_user=${id_user} AND id_list=${id_list}`;
  vec1 = await executeQuery(query, []);
  if (vec1.length != 0) return vec1[0].permission;
  else return false;
}

export async function getTodoList(id_list) {
  const query = `SELECT * FROM todo WHERE id_list=${id_list}`;
  return await executeQuery(query, []);
}

export async function getTodoID(id_list, id_todo) {
  const query = `SELECT * FROM todo WHERE id_list=${id_list} AND id_todo=${id_todo}`;
  return await executeQuery(query, []);
}

export async function newTodo(id_list, text) {
  const aux1 = '"' + text + '"';
  let actualDate = new Date().toISOString().split("T")[0];
  actualDate = '"' + actualDate + '"';
  const query = `INSERT INTO todo (id_list,creation_date,_text,deleted) VALUES (${id_list},${actualDate},${aux1},false)`;
  return await executeQuery(query, []);
}

export async function modTodo(id_list, id_todo, newText) {
  const aux1 = '"' + newText + '"';
  const query = `UPDATE todo SET _text=${aux1} WHERE id_list=${id_list} AND id_todo=${id_todo}`;
  return await executeQuery(query, []);
}
export async function delTodo(id_list, id_todo) {
  let isDeleted = await getTodoID(id_list, id_todo);
  if (isDeleted.length != 0) {
    isDeleted = isDeleted[0].deleted; //null es false y 0 es true
    if (isDeleted) {
      const query = `DELETE FROM todo WHERE id_list=${id_list} AND id_todo=${id_todo}`;
      return await executeQuery(query, []);
    } else {
      const query = `UPDATE todo SET deleted=true WHERE id_list=${id_list} AND id_todo=${id_todo}`;
      return await executeQuery(query, []);
    }
  } else return true;
}

export async function notDelTodo(id_list, id_todo) {
  const query = `UPDATE todo SET deleted=false WHERE id_list=${id_list} AND id_todo=${id_todo}`;
  return await executeQuery(query, []);
}
