import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import logging from "../helpers/logging";
import { dbOps, PromisablePoolCXN as pool } from "../helpers/mysql";

const NAMESPACE = "App";

dotenv.config();
const tbl = process.env.MYSQL_TBL_1;

// logs to console for any endpoint is visited
const topLog = (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

  res.on("finish", () => {
    logging.info(
      NAMESPACE,
      `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`
    );
  });

  next();
};

// same usage as cors from npm + also allow only 5 HTTP verbs
const cors = (req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", `Origin, X-Requested-With, Content-Type, Accept, Authorization`);

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET PATCH DELETE PUT POST");
    return res.status(200).json({});
  }

  next();
};

const getListMdlwr = (req: Request, res: Response, next: NextFunction) => {
  let countRes: { total_count: number }[];
  res.header("Access-Control-Expose-Headers", "X-Total-Count");

  const countQuery = `SELECT COUNT(*) as total_count FROM ${tbl}`;

  pool
    .execute(countQuery)
    .then((queryRes) => {
      const [rows, fields] = queryRes;
      countRes = JSON.parse(JSON.stringify(rows));
      // return res.status(200).json(getListRes);
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });

  //! This can outputs the total count, BUT IT IS ASYNC -> CANT SOLVE THIS ATM, AS WE NEED THIS IMMEDIATELY EACH TIME HTTP getList
  // res.header("X-Total-Count", countRes[0].total_count.toString());
  res.header("X-Total-Count", "1");
  //
  next();
};

// trigger when no other middlewares runs before it
// must be last middleware
const notExisted = (req: Request, res: Response, next: NextFunction) => {
  const err = new Error("Endpoint not existed!");

  return res.status(404).json({
    errMsg: err.message,
  });

  next();
};
// asd

export { topLog, cors, notExisted, getListMdlwr };
