import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const IP = process.env.MONGO_ADDR;
const uri = "mongodb://" + IP;
const client = new MongoClient(uri);

async function getUsersCollection() {
  await connectToBD();
  const db = client.db("auth");
  return db.collection("users");
}

async function connectToBD() {
  await client.connect();
}

export async function getUser(user) {
  try {
    const collection = await getUsersCollection();
    const usuario = await collection.findOne({ username: user });
    //client.disconnect();
    return usuario;
  } catch (e) {}
}

export async function regUser(user, pass) {
  try {
    const collection = await getUsersCollection();
    const usuario = await collection.findOne({ username: user });
    if (!usuario) {
      const insertar = await collection.insertOne({
        username: user,
        password: pass,
      });
      //client.disconnect();
      return insertar;
    } else {
      //client.disconnect();
      return false;
    }
  } catch (e) {
    throw new Error("mongoDB error");
  }
}

export async function modUser(user, newPass) {
  const collection = await getUsersCollection();
  return await collection.updateOne(
    { username: user },
    { $set: { password: newPass } }
  );
}

export async function delUser(user) {
  const collection = await getUsersCollection();
  return await collection.deleteOne({ username: user });
}
