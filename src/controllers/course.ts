import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import logging from "../helpers/logging";
import { Course, MySQLErr } from "../models/types";
import { PromisablePoolCXN as pool } from "../helpers/mysql";
import { mysqlErrorHdlr } from "../helpers/common";

//* Variables

const NAMESPACE = "CONTROLLERS/COURSE";

dotenv.config();
const tbl = process.env.MYSQL_TBL_2;

type ReqParams = {
  id: string;
};

type ReqQuery = {
  // default
  _end?: string;
  _order?: "ASC" | "DESC";
  _sort?: string;
  _start?: string;
  id: string;
};

//* Methods

const getListRACompatible = (
  req: Request<unknown, unknown, unknown, ReqQuery>,
  res: Response<Course[]>,
  next: NextFunction
) => {
  const query = `SELECT * FROM ${tbl} ORDER BY ${req.query._sort} ${req.query._order}`;
  const fishingQuery = req.query;
  const searchQuery = `SELECT * FROM ${tbl} WHERE id="${req.query.id}"`;

  if (req.query.id) {
    logging.info(NAMESPACE, `getList?course_id`, {
      reqParams: req.params,
      reqQuery: fishingQuery
    });
    pool
      .execute(searchQuery)
      .then((queryRes) => {
        const [rows, fields] = queryRes;
        const getListRes: Array<Course> = JSON.parse(JSON.stringify(rows));
        return res.status(200).json(getListRes);
      })
      .catch((queryErr) => {
        logging.error(NAMESPACE, queryErr.message, queryErr);
      });
  } else {
    logging.info(NAMESPACE, `getList`, {
      reqParams: req.params,
      reqQuery: fishingQuery
    });
    pool
      .execute(query)
      .then((queryRes) => {
        const [rows, fields] = queryRes;
        const getListRes: Array<Course> = JSON.parse(JSON.stringify(rows));
        return res.status(200).json(getListRes);
      })
      .catch((queryErr) => {
        logging.error(NAMESPACE, queryErr.message, queryErr);
      });
  }
};

const getOneRACompatible = (req: Request<ReqParams>, res: Response<Course>) => {
  const query = `SELECT * FROM ${tbl} WHERE id = ? `;
  const escapeValues = [req.params.id];

  pool
    .execute(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `getOne`, req.params);
      const [rows, fields] = queryRes;
      const getOneRes: Course[] = JSON.parse(JSON.stringify(rows));
      return res.status(200).json(getOneRes[0]);
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const createAndGetOneRACompatible = (
  req: Request<ReqParams, unknown, Course>,
  res: Response
) => {
  const createQuery = `INSERT INTO ${tbl} (id, course_title, date_started, date_ended, used_assignments, max_assignment_point, grade1_interval, grade2_interval, grade3_interval, grade4_interval, grade5_interval)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const createEscapeValues = [
    req.body.id,
    req.body.course_title,
    req.body.date_started.slice(0, 10),
    req.body.date_ended.slice(0, 10),
    req.body.used_assignments,
    req.body.max_assignment_point,
    req.body.grade1_interval,
    req.body.grade2_interval,
    req.body.grade3_interval,
    req.body.grade4_interval,
    req.body.grade5_interval
  ];
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.body.id];

  logging.info(NAMESPACE, `create`, req.body);
  pool
    .execute(createQuery, createEscapeValues)
    .then(() => {
      logging.info(NAMESPACE, `getOne`, req.params);
      pool
        .execute(getQuery, getEscapeValues)
        .then((queryRes) => {
          const [rows, fields] = queryRes;
          const createRes: Course[] = JSON.parse(JSON.stringify(rows));
          return res.status(200).json(createRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr: MySQLErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
      mysqlErrorHdlr(queryErr, res);
    });
};

const updateAndGetOneRACompatible = (
  req: Request<ReqParams, unknown, Course>,
  res: Response<Course>,
  next: NextFunction
) => {
  const updateQuery = `UPDATE ${tbl} SET 
  course_title = ?, 
  date_started = ?, 
  date_ended = ?,
  used_assignments = ?,
  max_assignment_point = ?,
  grade1_interval = ?, 
  grade2_interval = ?, 
  grade3_interval = ?,
  grade4_interval = ?, 
  grade5_interval = ? 
  WHERE id = ?`;
  const updateEscapeValues = [
    req.body.course_title,
    req.body.date_started.slice(0, 10),
    req.body.date_ended.slice(0, 10),
    req.body.used_assignments,
    req.body.max_assignment_point,
    req.body.grade1_interval,
    req.body.grade2_interval,
    req.body.grade3_interval,
    req.body.grade4_interval,
    req.body.grade5_interval,
    req.params.id
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
          const updateRes: Course[] = JSON.parse(JSON.stringify(rows));
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

const getOneAndDeleteRACompatible = (
  req: Request<ReqParams>,
  res: Response<Course>,
  next: NextFunction
) => {
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];
  const deleteQuery = `DELETE FROM ${tbl} WHERE id = ?`;
  const deleteEscapeValues = [req.params.id];
  let deleteRes: Course[];

  pool
    .execute(getQuery, getEscapeValues)
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
  getOneAndDeleteRACompatible
};
