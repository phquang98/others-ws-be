import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import logging from "../helpers/logging";
import { Course_Participant as PointKV, MySQLErr } from "../models/types";
import { PromisablePoolCXN as pool } from "../helpers/mysql";
import { calculateFinalGrades, newCalFinalGrades, mysqlErrorHdlr } from "../helpers/common";

//* Variables

const NAMESPACE = "CONTROLLERS/COURSE_PART";

dotenv.config();
const tbl = process.env.MYSQL_TBL_3; //

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
  // custom, usually people use their name to find all their points
  course_id?: string;
  customFilter?: string;
};

//* Methods
const getListRACompatible = (req: Request<{}, {}, {}, ReqQuery>, res: Response<PointKV[]>, next: NextFunction) => {
  let query = `SELECT * FROM ${tbl} ORDER BY ${req.query._sort} ${req.query._order}`;
  const fishingQuery = req.query;
  let searchQuery = `SELECT * FROM ${tbl} WHERE course_id="${req.query.course_id}"`;

  if (req.query.course_id) {
    logging.info(NAMESPACE, `getList?pointWho`, { reqParams: req.params, reqQuery: fishingQuery });
    pool
      .execute(searchQuery)
      .then((queryRes) => {
        const [rows, fields] = queryRes;
        const getListRes: Array<PointKV> = JSON.parse(JSON.stringify(rows));
        return res.status(200).json(getListRes);
      })
      .catch((queryErr) => {
        logging.error(NAMESPACE, queryErr.message, queryErr);
      });
  } else if (req.query.customFilter) {
    //! Lam au viet lai
    let winningShit = `SELECT * FROM ${tbl} WHERE participant_id = ?`;
    let shit = [req.query.customFilter];

    pool
      .execute(winningShit, shit)
      .then((queryRes) => {
        const [rows, fields] = queryRes;
        const getListRes: Array<PointKV> = JSON.parse(JSON.stringify(rows));
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
        const getListRes: Array<PointKV> = JSON.parse(JSON.stringify(rows));
        return res.status(200).json(getListRes);
      })
      .catch((queryErr) => {
        logging.error(NAMESPACE, queryErr.message, queryErr);
      });
  }
};

const getOneRACompatible = (req: Request<ReqParams>, res: Response<PointKV>, next: NextFunction) => {
  let query = `SELECT * FROM ${tbl} WHERE id = ? `;
  let escapeValues = [req.params.id];

  pool
    .execute(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `getOne`, req.params);
      const [rows, fields] = queryRes;
      const getOneRes: PointKV[] = JSON.parse(JSON.stringify(rows));
      return res.status(200).json(getOneRes[0]);
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const createAndGetOneRACompatible = (
  req: Request<ReqParams, {}, PointKV>,
  res: Response<PointKV>,
  next: NextFunction
) => {
  let createQuery = `INSERT INTO ${tbl} (id, course_id, participant_id, assignment_1, assignment_2, assignment_3, exam, grade) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const finalGrades = calculateFinalGrades([
    Number(req.body.assignment1),
    Number(req.body.assignment2),
    Number(req.body.assignment3),
    Number(req.body.exam),
  ]);
  const grade = newCalFinalGrades(
    [Number(req.body.assignment1), Number(req.body.assignment2), Number(req.body.assignment3), Number(req.body.exam)],
    [20, 40, 60, 80, 100]
  );
  let createEscapeValues = [
    req.body.id,
    req.body.course_id,
    req.body.participant_id,
    Number(req.body.assignment1),
    Number(req.body.assignment2),
    Number(req.body.assignment3),
    Number(req.body.exam),
    grade,
  ];
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.body.id];

  pool
    .execute(createQuery, createEscapeValues)
    .then(() => {
      logging.info(NAMESPACE, `create`, { obj: createEscapeValues, grade });
      pool
        .execute(getQuery, getEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `getOne`, req.params);
          const [rows, fields] = queryRes;
          const createRes: PointKV[] = JSON.parse(JSON.stringify(rows));
          return res.status(200).json(createRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr: MySQLErr) => {
      logging.error(NAMESPACE, queryErr.message, { queErr: queryErr, obj: createEscapeValues });
      mysqlErrorHdlr(queryErr, res);
    });
};

const updateAndGetOneRACompatible = (
  req: Request<ReqParams, {}, PointKV>,
  res: Response<PointKV>,
  next: NextFunction
) => {
  let updateQuery = `UPDATE ${tbl} SET assignment_1 = ?, assignment_2 = ?, assignment_3 = ?, exam = ?, grade = ? WHERE id = ?`;
  const finalGrades = calculateFinalGrades([
    Number(req.body.assignment1),
    Number(req.body.assignment2),
    Number(req.body.assignment3),
    Number(req.body.exam),
  ]);

  const grade = newCalFinalGrades(
    [Number(req.body.assignment1), Number(req.body.assignment2), Number(req.body.assignment3), Number(req.body.exam)],
    [20, 40, 60, 80, 100]
  );
  let updateEscapeValues = [
    Number(req.body.assignment1),
    Number(req.body.assignment2),
    Number(req.body.assignment3),
    Number(req.body.exam),
    grade,
    req.params.id,
  ];
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];

  pool
    .execute(updateQuery, updateEscapeValues)
    .then(() => {
      logging.info(NAMESPACE, `update`, { obj: updateEscapeValues, grade });
      pool
        .execute(getQuery, getEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `getOne`, req.params);
          const [rows, fields] = queryRes;
          const updateRes: PointKV[] = JSON.parse(JSON.stringify(rows));
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

const getOneAndDeleteRACompatible = (req: Request<ReqParams>, res: Response<PointKV>, next: NextFunction) => {
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];
  let deleteQuery = `DELETE FROM ${tbl} WHERE id = ?`;
  let deleteEscapeValues = [req.params.id];
  let deleteRes: PointKV[];

  pool
    .execute(getQuery, getEscapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `getOne from delete`, req.params);
      const [rows, fields] = queryRes;
      deleteRes = JSON.parse(JSON.stringify(rows));
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
