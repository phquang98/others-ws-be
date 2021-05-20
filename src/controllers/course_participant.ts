import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import logging from "../helpers/logging";
import {
  Course,
  Course_Participant as PointKV,
  MySQLErr
} from "../models/types";
import { PromisablePoolCXN as pool } from "../helpers/mysql";
import { newCalFinalGrades, mysqlErrorHdlr } from "../helpers/common";

// ~ Variables

const NAMESPACE = "CONTROLLERS/COURSE_PART";

dotenv.config();
const tbl = process.env.MYSQL_TBL_3;
const courseTbl = process.env.MYSQL_TBL_2;

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

// ~ CRUD Ops

const getListRACompatible = (
  req: Request<unknown, unknown, unknown, ReqQuery>,
  res: Response<PointKV[]>,
  next: NextFunction
) => {
  const query = `SELECT * FROM ${tbl} ORDER BY ${req.query._sort} ${req.query._order}`;
  const fishingQuery = req.query;
  const searchQuery = `SELECT * FROM ${tbl} WHERE course_id="${req.query.course_id}"`;

  if (req.query.course_id) {
    logging.info(NAMESPACE, `getList?pointWho`, {
      reqParams: req.params,
      reqQuery: fishingQuery
    });
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
    // ! Lam au viet lai
    const winningShit = `SELECT * FROM ${tbl} WHERE participant_id = ?`;
    const shit = [req.query.customFilter];

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
    logging.info(NAMESPACE, `getList`, {
      reqParams: req.params,
      reqQuery: fishingQuery
    });
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

const getOneRACompatible = (
  req: Request<ReqParams>,
  res: Response<PointKV>,
  next: NextFunction
) => {
  const query = `SELECT * FROM ${tbl} WHERE id = ? `;
  const escapeValues = [req.params.id];

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
  req: Request<ReqParams, unknown, PointKV>,
  res: Response<PointKV>,
  next: NextFunction
) => {
  // const getIntrvlQuery = `SELECT * FROM ${courseTbl} WHERE id = ?`;
  // const intrvlEscapeValues = [req.body.course_id];

  // let grade;

  const createQuery = `INSERT INTO ${tbl} (course_id, participant_id, assignment_1, assignment_2, assignment_3, exam, grade) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const createEscapeValues = [
    req.body.course_id,
    req.body.participant_id,
    Number(req.body.assignment_1),
    Number(req.body.assignment_2),
    Number(req.body.assignment_3),
    Number(req.body.exam),
    Number(res.locals.gradeNe)
  ];
  // let cacDMM = ["CS100", "e258693", 10, 9, 8, 7, 0];

  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.body.id];

  logging.info(NAMESPACE, "2nd part", { createQuery, createEscapeValues });
  pool
    .execute(createQuery, createEscapeValues)
    .then(() => {
      pool
        .execute(getQuery, getEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `getOne`, req.params);
          const [rows, fields] = queryRes;
          const createRes: PointKV[] = JSON.parse(JSON.stringify(rows));
          console.log(createRes[0]);
          // return res.status(200).json(createRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr: MySQLErr) => {
      logging.error(NAMESPACE, queryErr.message, {
        queErr: queryErr,
        obj: createEscapeValues
      });
      mysqlErrorHdlr(queryErr, res);
    });

  // logging.info(NAMESPACE, `1st part`, { course: req.body.course_id, rest: req.body });
  // pool
  //   .execute(getIntrvlQuery, intrvlEscapeValues)
  //   .then((queryRes) => {
  //     const [rows, fields] = queryRes;
  //     const courseForGrade: Course[] = JSON.parse(JSON.stringify(rows));
  //     const { grade1_interval, grade2_interval, grade3_interval, grade4_interval, grade5_interval } = courseForGrade[0];
  //     grade = newCalFinalGrades(
  //       [
  //         Number(req.body.assignment_1),
  //         Number(req.body.assignment_2),
  //         Number(req.body.assignment_3),
  //         Number(req.body.exam),
  //       ],
  //       [
  //         Number(grade1_interval),
  //         Number(grade2_interval),
  //         Number(grade3_interval),
  //         Number(grade4_interval),
  //         Number(grade5_interval),
  //       ]
  //     );
  //     createEscapeValues = [...createEscapeValues, grade];
  //     logging.info(NAMESPACE, `tell me why ???`, {
  //       grade,
  //       rest: [req.body.assignment_1, req.body.assignment_2, req.body.assignment_3, req.body.exam],
  //     });

  //     logging.info(NAMESPACE, `create`, { createQuery, createEscapeValues });

  //     pool
  //       .execute(createQuery, cacDMM)
  //       .then(() => {
  //         pool
  //           .execute(getQuery, getEscapeValues)
  //           .then((queryRes) => {
  //             logging.info(NAMESPACE, `getOne`, req.params);
  //             const [rows, fields] = queryRes;
  //             const createRes: PointKV[] = JSON.parse(JSON.stringify(rows));
  //             console.log(createRes[0]);
  //             // return res.status(200).json(createRes[0]);
  //           })
  //           .catch((queryErr) => {
  //             logging.error(NAMESPACE, queryErr.message, queryErr);
  //           });
  //       })
  //       .catch((queryErr: MySQLErr) => {
  //         // logging.error(NAMESPACE, queryErr.message, { queErr: queryErr, obj: createEscapeValues });
  //         mysqlErrorHdlr(queryErr, res);
  //       });
  //   })
  //   .catch((queryErr: MySQLErr) => {
  //     // logging.error(NAMESPACE, queryErr.message, { queErr: queryErr, obj: createEscapeValues });
  //     mysqlErrorHdlr(queryErr, res);
  //   });

  // pool
  //   .execute(createQuery, createEscapeValues)
  //   .then(() => {
  //     logging.info(NAMESPACE, `create`, { obj: createEscapeValues, grade });
  //     pool
  //       .execute(getQuery, getEscapeValues)
  //       .then((queryRes) => {
  //         logging.info(NAMESPACE, `getOne`, req.params);
  //         const [rows, fields] = queryRes;
  //         const createRes: PointKV[] = JSON.parse(JSON.stringify(rows));
  //         return res.status(200).json(createRes[0]);
  //       })
  //       .catch((queryErr) => {
  //         logging.error(NAMESPACE, queryErr.message, queryErr);
  //       });
  //   })
};

const updateAndGetOneRACompatible = (
  req: Request<ReqParams, unknown, PointKV>,
  res: Response<PointKV>,
  next: NextFunction
) => {
  const updateQuery = `UPDATE ${tbl} SET assignment_1 = ?, assignment_2 = ?, assignment_3 = ?, exam = ?, grade = ? WHERE id = ?`;

  const grade = newCalFinalGrades(
    [
      Number(req.body.assignment_1),
      Number(req.body.assignment_2),
      Number(req.body.assignment_3),
      Number(req.body.exam)
    ],
    [20, 40, 60, 80, 100]
  );
  const updateEscapeValues = [
    Number(req.body.assignment_1),
    Number(req.body.assignment_2),
    Number(req.body.assignment_3),
    Number(req.body.exam),
    grade,
    req.params.id
  ];
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];

  // Retard code block start
  const getIntrvlQuery = `SELECT * FROM ${courseTbl} WHERE id = ?`;
  const intrvlEscapeValues = [req.body.course_id];

  logging.info(NAMESPACE, `get interval`, {
    course: req.body.course_id,
    rest: req.body
  });
  pool
    .execute(getIntrvlQuery, intrvlEscapeValues)
    .then((queryRes) => {
      const [rows, fields] = queryRes;
      const courseForGrade: Course[] = JSON.parse(JSON.stringify(rows));
      const {
        grade1_interval,
        grade2_interval,
        grade3_interval,
        grade4_interval,
        grade5_interval
      } = courseForGrade[0];
      const grade = newCalFinalGrades(
        [
          Number(req.body.assignment_1),
          Number(req.body.assignment_2),
          Number(req.body.assignment_3),
          Number(req.body.exam)
        ],
        [
          Number(grade1_interval),
          Number(grade2_interval),
          Number(grade3_interval),
          Number(grade4_interval),
          Number(grade5_interval)
        ]
      );
      console.log("golden shit", grade);
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });

  // Retard code block end

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

const getOneAndDeleteRACompatible = (
  req: Request<ReqParams>,
  res: Response<PointKV>,
  next: NextFunction
) => {
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];
  const deleteQuery = `DELETE FROM ${tbl} WHERE id = ?`;
  const deleteEscapeValues = [req.params.id];
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

const getIntrvl = (
  req: Request<ReqParams, unknown, PointKV>,
  res: Response<PointKV>,
  next: NextFunction
) => {
  const getIntrvlQuery = `SELECT * FROM ${courseTbl} WHERE id = ?`;
  const intrvlEscapeValues = [req.body.course_id];
  let grade;

  res.locals;

  logging.info(NAMESPACE, `1st part`, {
    course: req.body.course_id,
    rest: req.body
  });
  pool
    .execute(getIntrvlQuery, intrvlEscapeValues)
    .then((queryRes) => {
      const [rows, fields] = queryRes;
      const courseForGrade: Course[] = JSON.parse(JSON.stringify(rows));
      const {
        grade1_interval,
        grade2_interval,
        grade3_interval,
        grade4_interval,
        grade5_interval
      } = courseForGrade[0];
      grade = newCalFinalGrades(
        [
          Number(req.body.assignment_1),
          Number(req.body.assignment_2),
          Number(req.body.assignment_3),
          Number(req.body.exam)
        ],
        [
          Number(grade1_interval),
          Number(grade2_interval),
          Number(grade3_interval),
          Number(grade4_interval),
          Number(grade5_interval)
        ]
      );
      res.locals = { gradeNe: grade };
      next();
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
  getIntrvl
};
