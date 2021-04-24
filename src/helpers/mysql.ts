import mysql2, { ConnectionOptions, RowDataPacket } from "mysql2";
import { Participant } from "../models/types";

import config from "./config";

const ConnParams: ConnectionOptions = {
  user: config.mysql.username,
  password: config.mysql.password,
  host: config.mysql.host,
  database: config.mysql.db,
};

// Create a conn instance + connect() to the DB + execute the query
// 2nd arg: when writing prepared statment query aka ?/escape character
const dbOps = async (queryValue: string, escapeValues?: any | any[] | { [param: string]: any }) => {
  const connInstance = mysql2.createConnection(ConnParams).promise();
  return connInstance.execute(queryValue, escapeValues);
  // return await connInstance.query(queryValue);
};

const PromisablePoolCXN = mysql2.createPool(ConnParams).promise();

export { dbOps, PromisablePoolCXN };
