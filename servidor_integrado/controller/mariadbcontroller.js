import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { databaseError } from "../classes/databaseError.js";
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
 * @return metadata or data from the executed query or undefined
 * @throws databaseError: If an error occurs durin the execution of the query
 */
async function executeQuery(query, params) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (err) {
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to get an user by the username
 * @param username: The username of the user to obtain
 * @return An empty array or the user in the first position
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function getUser(username) {
  try{
    const aux1 = '"' + username + '"';
    const query = `SELECT * FROM users WHERE _user=${aux1}`;
    return await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to register an user into the database
 * @param username: The username of the user to create
 * @param pass: The hashed password of the user to create
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function regUser(user, pass) {
  try{
    const aux1 = '"' + user + '"';
    const aux2 = '"' + pass + '"';
    const query = `INSERT INTO users (_user, _password) VALUES (${aux1}, ${aux2})`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to change the password of an user into the database
 * @param username: The username of the user to be modify
 * @param pass: The new hashed password
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function modUser(user, pass) {
  try{
    const aux1 = '"' + user + '"';
    const aux2 = '"' + pass + '"';
    const query = `UPDATE users SET _password=${aux2} WHERE _user=${aux1}`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to delete an user from the database
 * @param username: The username of the user to be deleted
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function delUser(user) {
  try{
    const aux1 = '"' + user + '"';
    const query = `DELETE FROM users WHERE _user=${aux1}`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to get a list by the identificator
 * @param id: The identificator of the list
 * @return An empty array or the list object in the first position
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function getListId(id) {
  try{
    const query = `SELECT * FROM _list WHERE id_list=${id}`;
    return await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to get every list by that the user is related to
 * @param username: The username of the user
 * @return An empty array or a list object in the each position
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function getListUser(username) {
  try{
    const aux1 = '"' + username + '"';
    const query1 = `SELECT l.* FROM _list l,users u WHERE l.id_administrator=u.id_user AND u._user=${aux1}`;
    const query2 = `SELECT l.* FROM _list l,users u,contributes c WHERE c.id_list=l.id_list AND c.id_user=u.id_user AND u._user=${aux1}`;
    const vec1 = await executeQuery(query1, []);
    const vec2 = await executeQuery(query2, []);
  
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
  }catch(err){
    throw new databaseError(err.message,500);
  }

}

/**
 * @brief
 * Creates the query to create a list into the database
 * @param username: The username of the creator
 * @param name: The name of the list
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function newList(username, name) {
  try{
    const id_user = await getIdFromUser(username);
    const aux2 = '"' + name + '"';
    let actualDate = new Date().toISOString().split("T")[0];
    actualDate = '"' + actualDate + '"';
    const query = `INSERT INTO _list (name,id_administrator,creation_date) VALUES (${aux2},${id_user},${actualDate})`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to change the name of a list from the database
 * @param id: The identificator of the list
 * @param newname: The new name for the list
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function modList(id, newname) {
  try{
    const aux = '"' + newname + '"';
    const query = `UPDATE _list SET name=${aux} WHERE id_list=${id}`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to delete a list from the database
 * @param id: The identificator of the list
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function delList(id) {
  try{
    const query = `DELETE FROM _list WHERE id_list=${id}`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to get the permission of a user in a list
 * @param id_user: The username of the user
 * @param id_list: The identificator of the list
 * @return The permission of the user ("","R","RW")
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function getPermission(id_user, id_list) {
  try{
    let query = `SELECT * FROM _list WHERE id_administrator=${id_user} AND id_list=${id_list}`;
    let vec1 = await executeQuery(query, []);
    if (vec1.length != 0) return "RW";
    query = `SELECT * FROM contributes WHERE id_user=${id_user} AND id_list=${id_list}`;
    vec1 = await executeQuery(query, []);
    if (vec1.length != 0) return vec1[0].permission;
    else return "";
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to get all the todos from a list
 * @param id_list: The identificator of the list
 * @return An empty array or a todo object in the each position
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function getTodoList(id_list) {
  try{
    const query = `SELECT * FROM todo WHERE id_list=${id_list}`;
    return await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to get a todo by the identificator and the indentificator of a list
 * @param id_list: The identificator of the list
 * @param id_todo: The identificator of the todo
 * @return An empty array or a todo object in the first position
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function getTodoById(id_list, id_todo) {
  try{
    const query = `SELECT * FROM todo WHERE id_list=${id_list} AND id_todo=${id_todo}`;
    return await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to create a todo into a list
 * @param id_list: The identificator of the list
 * @param text: The text in the todo
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function newTodo(id_list, text) {
  try{
    const aux1 = '"' + text + '"';
    let actualDate = new Date().toISOString().split("T")[0];
    actualDate = '"' + actualDate + '"';
    const query = `INSERT INTO todo (id_list,creation_date,_text,deleted) VALUES (${id_list},${actualDate},${aux1},false)`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to modify a todo into a list
 * @param id_list: The identificator of the list
 * @param id_todo: The identificator of the todo
 * @param newText: The new text in the todo
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function modTodo(id_list, id_todo, newText) {
  try{
    const aux1 = '"' + newText + '"';
    const query = `UPDATE todo SET _text=${aux1} WHERE id_list=${id_list} AND id_todo=${id_todo}`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to mark as "deleted" or delete a todo from a list
 * @param id_list: The identificator of the list
 * @param id_todo: The identificator of the todo
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function delTodo(id_list, id_todo) {
  try{
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
  }catch(err){
    throw new databaseError(err.message,500);
  }

}

/**
 * @brief
 * Creates the query to mark as "not deleted" a todo from a list
 * @param id_list: The identificator of the list
 * @param id_todo: The identificator of the todo
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function notDelTodo(id_list, id_todo) {
  try{
    const query = `UPDATE todo SET deleted=false WHERE id_list=${id_list} AND id_todo=${id_todo}`;
    await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to get all the contributors from a list
 * @param id_list: The identificator of the list
 * @return An empty array or a contributor object in the each position
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function getAllContributors(id_list) {
  try{
    const query = `SELECT u.id_user,u._user FROM contributes c,_list l, users u WHERE c.id_list=l.id_list AND c.id_list=${id_list}`;
    return await executeQuery(query, []);
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to deletes a contributor from a list
 * @param id_list: The identificator of the list
 * @param user_contributor: The username of the user to delete
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function delContributor(id_list, user_contributor) {
  try{
    const id_user = await getIdFromUser(user_contributor);
    if (id_user) {
      const query = `DELETE FROM contributes WHERE id_user=${id_user} AND id_list=${id_list}`;
      await executeQuery(query, []);
    }
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to create a contributor for a list
 * @param id_list: The identificator of the list
 * @param id_user: The identificator of the user
 * @param permission: The permission to register into the contributor
 * @return -
 * @throws databaseError: If an error occurs durin the execution of the query
 */

export async function newContributor(id_list, id_user, permission) {
  try{
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
  }catch(err){
    throw new databaseError(err.message,500);
  }
}

/**
 * @brief
 * Creates the query to get an identificator from the username
 * @param username: The username of the user
 * @return undefinded or the user identificator
 * @throws databaseError: If an error occurs durin the execution of the query
 */
export async function getIdFromUser(username) {
  try{
    const aux1 = '"' + username + '"';
    const query = `SELECT * FROM users WHERE _user=${aux1}`;
    let user = await executeQuery(query, []);
    if (user.length != 0) {
      return user[0].id_user;
    } else {
      return undefined;
    }
  }catch(err){
    throw new databaseError(err.message,500);
  }
}
