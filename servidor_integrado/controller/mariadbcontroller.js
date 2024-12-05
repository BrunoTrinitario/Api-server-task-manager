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
