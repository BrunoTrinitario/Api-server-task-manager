import jwt from "jsonwebtoken";
import { controllerError } from "../classes/controllerError.js";
import { MESSAGES } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();
const SECRET = process.env.SECRET;

/**
 * @brief
 * Gets the token from the request
 * @param req: Request object
 * @return the json web token
 * @throws controllerError: If the authorization header its invalid
 */
export function getToken(req){
    try{
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token){
            throw new controllerError(MESSAGES.INV_TOK,401);
        }else
            return token
    }catch(e){
        throw new controllerError(MESSAGES.INV_TOK,401);
    }
    
}

/**
 * @brief
 * Gets the username from the payload of the jwt token
 * @param token: JWT token
 * @return The username form the payload
 */
export function getUsernameFromToken(token){
    const payload=jwt.decode(token);
    return payload.username
}

/**
 * @brief
 * Verifies if an jwt its expired
 * @param token: JWT token
 * @return -
 * @throws controllerError: If the jwt its expired
 */
export function verifyToken(token){
    try{
        jwt.verify(token,SECRET);
    }catch(e){
        throw new controllerError(MESSAGES.ERR_VER,403);
    }
}

/**
 * @brief
 * Generates a json web token
 * @param username: The username of the user
 * @param seconds: time to live of jwt
 * @return the json web token
 */
export function tokenGenerator(username, seconds) {
    const data = {
      username,
      exp: Math.floor(Date.now() / 1000) + seconds,
    };
    try{
        return jwt.sign(data, SECRET);
    }catch(e){
        throw new controllerError(e.message,400);
    }

  }