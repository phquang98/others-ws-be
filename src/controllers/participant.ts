import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import logging from "../config/logging";
import { dbOps, PromisablePoolCXN as pool } from "../config/mysql";
import { xlsxQueryConstructor } from "../middlewares/upload";
import { Participant } from "../models/types";

//* Variables

const NAMESPACE = "CONTROLLERS/PART";

dotenv.config();
const tbl = process.env.MYSQL_TBL_1;

type ReqParams = {
  id?: number;
};

type ReqQuery = {
  // default
  _end?: string;
  _order?: "ASC" | "DESC";
  _sort?: string;
  _start?: string;
  id?: string;
  // custom
  last_name?: string;
};

//* Methods

const getListRACompatible = (req: Request<{}, {}, {}, ReqQuery>, res: Response<Participant[]>, next: NextFunction) => {
  let query = `SELECT * FROM ${tbl} ORDER BY ${req.query._sort} ${req.query._order}`;
  const fishingQuery = req.query;
  let searchQuery = `SELECT * FROM ${tbl} WHERE last_name="${req.query.last_name}"`;

  if (req.query.last_name) {
    logging.info(NAMESPACE, `getList?last_name`, { reqParams: req.params, reqQuery: fishingQuery });
    pool
      .execute(searchQuery)
      .then((queryRes) => {
        const [rows, fields] = queryRes;
        const getListRes: Array<Participant> = JSON.parse(JSON.stringify(rows));
        return res.status(200).json(getListRes);
      })
      .catch((queryErr) => {
        logging.error(NAMESPACE, queryErr.message, queryErr);
      });
  } else {
    logging.info(NAMESPACE, `getList`, { reqParams: req.params, reqQuery: fishingQuery });
    pool
      .execute(query)
      .then((queryRes) => {
        const [rows, fields] = queryRes;
        const getListRes: Array<Participant> = JSON.parse(JSON.stringify(rows));
        return res.status(200).json(getListRes);
      })
      .catch((queryErr) => {
        logging.error(NAMESPACE, queryErr.message, queryErr);
      });
  }
};

const getOneRACompatible = (req: Request<ReqParams>, res: Response<Participant>, next: NextFunction) => {
  let query = `SELECT * FROM ${tbl} WHERE id = ? `;
  let escapeValues = [req.params.id];

  pool
    .execute(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `getOne`, req.params);
      const [rows, fields] = queryRes;
      const getOneRes: Participant[] = JSON.parse(JSON.stringify(rows));
      return res.status(200).json(getOneRes[0]);
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const createAndGetOneRACompatible = (
  req: Request<ReqParams, {}, Participant>,
  res: Response<Participant>,
  next: NextFunction
) => {
  let createQuery = `INSERT INTO ${tbl} (id, first_name, last_name, participant_id, dob, email) 
  VALUES (?, ?, ?, ?, ?, ?)`;
  let createEscapeValues = [
    req.body.id,
    req.body.first_name,
    req.body.last_name,
    req.body.participant_id,
    req.body.dob,
    req.body.email,
  ];
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.body.id];

  pool
    .execute(createQuery, createEscapeValues)
    .then(() => {
      logging.info(NAMESPACE, `create`, req.body);
      pool
        .execute(getQuery, getEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `getOne`, req.params);
          const [rows, fields] = queryRes;
          const createRes: Participant[] = JSON.parse(JSON.stringify(rows));
          return res.status(200).json(createRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr); //
    });
};

const updateAndGetOneRACompatible = (
  req: Request<ReqParams, {}, Participant>,
  res: Response<Participant>,
  next: NextFunction
) => {
  let updateQuery = `UPDATE ${tbl} SET first_name = ?, last_name = ?, participant_id = ?, dob = ?, email = ? WHERE id = ?`;
  let updateEscapeValues = [
    req.body.first_name,
    req.body.last_name,
    req.body.participant_id,
    req.body.dob.slice(0, 10), //
    req.body.email,
    req.params.id,
  ];
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];

  pool
    .execute(updateQuery, updateEscapeValues)
    .then(() => {
      logging.info(NAMESPACE, `update`, req.body);
      pool
        .execute(getQuery, getEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `getOne`, req.params);
          const [rows, fields] = queryRes;
          const updateRes: Participant[] = JSON.parse(JSON.stringify(rows));
          return res.status(200).json(updateRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const getOneAndDeleteRACompatible = (req: Request<ReqParams>, res: Response<Participant>, next: NextFunction) => {
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];
  let deleteQuery = `DELETE FROM ${tbl} WHERE id = ?`;
  let deleteEscapeValues = [req.params.id];
  let deleteRes: Participant[];

  pool
    .execute(getQuery, getEscapeValues) //
    .then((queryRes) => {
      logging.info(NAMESPACE, `getOne from delete`, req.params);
      const [rows, fields] = queryRes;
      deleteRes = JSON.parse(JSON.stringify(rows)); // retain the entity to return to FE later
      pool
        .execute(deleteQuery, deleteEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `delete`, req.params);
          return res.status(200).json(deleteRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

export {
  getListRACompatible,
  getOneRACompatible,
  createAndGetOneRACompatible,
  updateAndGetOneRACompatible,
  getOneAndDeleteRACompatible,
};
