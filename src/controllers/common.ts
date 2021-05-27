import { Request, Response } from "express";

import logging from "../helpers/logging";
import { PromisablePoolCXN as pool } from "../helpers/mysql";
import { MySQLErr, MySQLErrorNum } from "../models/types";

// ~ File vars

const NAMESPACE = "CONTROLLER/COMMON";

// ~ Generics CRUD Ops RA compatibles

/**
 * Runs a query, then return an arr of objs
 * Notes:
 * - remember to extract like queryRes[0] cause getOne RA only has 1 obj, not 1 arr contains 1 obj
 */
const triggerQuery = async <
  ReqPrmsHere,
  ResBdHere,
  ReqBdHere,
  ReqQrHere,
  ResLclsHere
>(
  req: Request<ReqPrmsHere, ResBdHere, ReqBdHere, ReqQrHere, ResLclsHere>,
  res: Response<ResBdHere, ResLclsHere>,
  namespaceLog: string,
  crudLog: string,
  query: string,
  escapeValues?: (string | number | undefined)[]
) => {
  try {
    logging.info(namespaceLog, crudLog, {
      reqParams: req.params,
      reqBody: req.body,
      reqQuery: req.query,
      resLocal: res.locals
    });
    const rawDataPacket = await pool.execute(query, escapeValues);
    const [rows] = rawDataPacket;
    const queryRes = JSON.parse(JSON.stringify(rows));
    return queryRes;
  } catch (e) {
    console.log("Failed to execute SQL, check the query.");
  }
};

// ~ Custom Server Ops

// const fetchCourseThreshold = <
//   ReqPrmsHere,
//   ReqBdHere,
//   ReqQrHere,
//   ResBdHere,
//   ResLclsHere
// >(
//   req: Request<ReqPrmsHere, ResBdHere, ReqBdHere, ReqQrHere, ResLclsHere>,
//   res: Response<ResBdHere, ResLclsHere>,
//   next: NextFunction,
//   query: string,
//   escapeValues?: string
// ) => {
//   logging.info(NAMESPACE, `fetchCourseThreshold`, {
//     reqParams: req.params,
//     reqBody: req.body,
//     reqQuery: req.query
//   });
//   pool
//     .execute(query, escapeValues)
//     .then((queryRes) => {
//       const [rows] = queryRes;
//       const courseForGrade: Course[] = JSON.parse(JSON.stringify(rows));
//       const {
//         grade1_interval,
//         grade2_interval,
//         grade3_interval,
//         grade4_interval,
//         grade5_interval
//       } = courseForGrade[0];
//       const grade = newCalFinalGrades(
//         [
//           Number(req.body.assignment_1),
//           Number(req.body.assignment_2),
//           Number(req.body.assignment_3),
//           Number(req.body.exam)
//         ],
//         [
//           Number(grade1_interval),
//           Number(grade2_interval),
//           Number(grade3_interval),
//           Number(grade4_interval),
//           Number(grade5_interval)
//         ]
//       );
//       res.locals = { gradeNe: grade };
//       next();
//     })
//     .catch((queryErr) => {
//       logging.error(NAMESPACE, queryErr.message, queryErr);
//       mysqlErrorHdlr(queryErr, res);
//     });
// };

// ~ Error Handler for Controller Ops

const mysqlErrorHdlr = (queryErr: MySQLErr, res: Response) => {
  switch (queryErr.errno) {
    case MySQLErrorNum.DUPLICATE_ENTRY:
      return res
        .status(409)
        .json({ message: `Key value is duplicated. Please change key value.` });
    case MySQLErrorNum.FOREIGN_KEY_NOT_EXISTED:
      return res
        .status(409)
        .json({ message: `Key value not existed. Please change key value.` });
    default:
      console.log("Switch key value is empty!");
      return res.status(400).json({ message: `Some error has occured!` });
  }
};

export { triggerQuery };
