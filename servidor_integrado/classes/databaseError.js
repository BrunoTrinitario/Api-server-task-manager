/**
 * @brief
 * This class its a modification from the class "Error", having a constructor that
 * allows to create the object with a code error, an a message
 */
export class databaseError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = "databaseError";
    }
  }