import mysql from "mysql2/promise";
import dotenv from "dotenv";
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

/**
 * @brief
 * Executes a query into the database
 * @param query: The query to execute
 * @param params: Aditional parameters
 * @return metadata/data of the executed query of false
 */
async function executeQuery(query, params) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (err) {
    console.error("Error en la consulta:", err.message);
    return false;
  }
}

/**
 * @brief
 * Creates the query to get an user by the username
 * @param username: The username of the user
 * @return An empty array or with the user in the first position
 */
export async function getUser(username) {
  const aux1 = '"' + username + '"';
  const query = `SELECT * FROM users WHERE _user=${aux1}`;
  return await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to register an user into the database
 * @param username: The username of the user
 * @param pass: The hashed password
 * @return -
 */
export async function regUser(user, pass) {
  const aux1 = '"' + user + '"';
  const aux2 = '"' + pass + '"';
  const query = `INSERT INTO users (_user, _password) VALUES (${aux1}, ${aux2})`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to change the password of an user into the database
 * @param username: The username of the user
 * @param pass: The new hashed password
 * @return -
 */
export async function modUser(user, pass) {
  const aux1 = '"' + user + '"';
  const aux2 = '"' + pass + '"';
  const query = `UPDATE users SET _password=${aux2} WHERE _user=${aux1}`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to delete an user of the database
 * @param username: The username of the user
 * @return -
 */
export async function delUser(user) {
  const aux1 = '"' + user + '"';
  const query = `DELETE FROM users WHERE _user=${aux1}`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to get a list by the identificator
 * @param id: The identificator of the list
 * @return An empty array or with the list in the first position
 */
export async function getListId(id) {
  const query = `SELECT * FROM _list WHERE id_list=${id}`;
  return await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to get every list by that the user is related to
 * @param username: The username of the user
 * @return An empty array or with a list in the each position
 */
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

/**
 * @brief
 * Creates the query to create a list into the database
 * @param username: The username of the creator
 * @param name: The name of the list
 * @return -
 */
export async function newList(username, name) {
  const id_user = await getIdFromUser(username);
  const aux2 = '"' + name + '"';
  let actualDate = new Date().toISOString().split("T")[0];
  actualDate = '"' + actualDate + '"';
  const query = `INSERT INTO _list (name,id_administrator,creation_date) VALUES (${aux2},${id_user},${actualDate})`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to change the name of a list into the database
 * @param username: The username of the creator
 * @param id: The identificator of the list
 * @param newname: The new name for the list
 * @return -
 */
export async function modList(id, newname) {
  const aux = '"' + newname + '"';
  const query = `UPDATE _list SET name=${aux} WHERE id_list=${id}`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to delete of a list
 * @param id: The identificator of the list
 * @return -
 */
export async function delList(id) {
  const query = `DELETE FROM _list WHERE id_list=${id}`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to get the permission of a user in a list
 * @param id_user: The username of the user
 * @param id_list: The identificator of the list
 * @return The permission of the user ("","R","RW")
 */
export async function getPermission(id_user, id_list) {
  let query = `SELECT * FROM _list WHERE id_administrator=${id_user} AND id_list=${id_list}`;
  let vec1 = await executeQuery(query, []);
  if (vec1.length != 0) return "RW";
  query = `SELECT * FROM contributes WHERE id_user=${id_user} AND id_list=${id_list}`;
  vec1 = await executeQuery(query, []);
  if (vec1.length != 0) return vec1[0].permission;
  else return "";
}

/**
 * @brief
 * Creates the query to get all the todos from a list
 * @param id_list: The identificator of the list
 * @return An empty array or with a todo in the each position
 */
export async function getTodoList(id_list) {
  const query = `SELECT * FROM todo WHERE id_list=${id_list}`;
  return await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to get a todo by the identificator
 * @param id_list: The identificator of the list
 * @param id_todo: The identificator of the todo
 * @return An empty array or with a todo in the first position
 */
export async function getTodoById(id_list, id_todo) {
  const query = `SELECT * FROM todo WHERE id_list=${id_list} AND id_todo=${id_todo}`;
  return await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to create a todo in a list
 * @param id_list: The identificator of the list
 * @param text: The text in the todo
 * @return -
 */
export async function newTodo(id_list, text) {
  const aux1 = '"' + text + '"';
  let actualDate = new Date().toISOString().split("T")[0];
  actualDate = '"' + actualDate + '"';
  const query = `INSERT INTO todo (id_list,creation_date,_text,deleted) VALUES (${id_list},${actualDate},${aux1},false)`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to modify a todo into a list
 * @param id_list: The identificator of the list
 * @param id_todo: The identificator of the todo
 * @param newText: The new text in the todo
 * @return -
 */
export async function modTodo(id_list, id_todo, newText) {
  const aux1 = '"' + newText + '"';
  const query = `UPDATE todo SET _text=${aux1} WHERE id_list=${id_list} AND id_todo=${id_todo}`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to mark as deleted or delete a todo from a list
 * @param id_list: The identificator of the list
 * @param id_todo: The identificator of the todo
 * @return -
 */
export async function delTodo(id_list, id_todo) {
  let isDeleted = await getTodoById(id_list, id_todo);
  if (isDeleted.length != 0) {
    isDeleted = isDeleted[0].deleted;
    if (isDeleted) {
      const query = `DELETE FROM todo WHERE id_list=${id_list} AND id_todo=${id_todo}`;
      await executeQuery(query, []);
    } else {
      const query = `UPDATE todo SET deleted=true WHERE id_list=${id_list} AND id_todo=${id_todo}`;
      await executeQuery(query, []);
    }
  }
}

/**
 * @brief
 * Creates the query to mark as not deleted a todo from a list
 * @param id_list: The identificator of the list
 * @param id_todo: The identificator of the todo
 * @return -
 */
export async function notDelTodo(id_list, id_todo) {
  const query = `UPDATE todo SET deleted=false WHERE id_list=${id_list} AND id_todo=${id_todo}`;
  await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to get all the contributors from a list
 * @param id_list: The identificator of the list
 * @return An empty array or with a contributor in the each position
 */
export async function getAllContributors(id_list) {
  const query = `SELECT u.id_user,u._user FROM contributes c,_list l, users u WHERE c.id_list=l.id_list AND c.id_list=${id_list}`;
  return await executeQuery(query, []);
}

/**
 * @brief
 * Creates the query to deletes a contributor from a list
 * @param id_list: The identificator of the list
 * @param user_contributor: The username of the user to delete
 * @return -
 */
export async function delContributor(id_list, user_contributor) {
  const id_user = await getIdFromUser(user_contributor);
  if (id_user) {
    const query = `DELETE FROM contributes WHERE id_user=${id_user} AND id_list=${id_list}`;
    await executeQuery(query, []);
  }
}

/**
 * @brief
 * Creates the query to create a contributor for a list
 * @param id_list: The identificator of the list
 * @param id_user: The identificator of the user
 * @param permission: The permission to register into the contributor
 * @return -
 */

export async function newContributor(id_list, id_user, permission) {
  let query = `SELECT * FROM contributes WHERE id_list=${id_list} AND id_user=${id_user}`;
  const user = await executeQuery(query, []);
  const aux1 = '"' + permission + '"';
  if (user.length != 0) {
    query = `UPDATE contributes SET permission=${aux1} WHERE id_list=${id_list} AND id_user=${id_user}`;
    await executeQuery(query, []);
  } else {
    query = `INSERT INTO contributes (id_list,id_user,permission) VALUES (${id_list},${id_user},${aux1})`;
    await executeQuery(query, []);
  }
}

/**
 * @brief
 * Creates the query to get an id_user from the username
 * @param username: The username of the user
 * @return undefinded or the user identificator
 */
export async function getIdFromUser(username) {
  const aux1 = '"' + username + '"';
  const query = `SELECT * FROM users WHERE _user=${aux1}`;
  let user = await executeQuery(query, []);
  if (user.length != 0) {
    return user[0].id_user;
  } else {
    return undefined;
  }
}
