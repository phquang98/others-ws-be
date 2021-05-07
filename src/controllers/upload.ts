import { Request, Response, NextFunction } from "express";

import logging from "../helpers/logging";
import { PromisablePoolCXN as pool } from "../helpers/mysql";
import { MySQLErr, Participant } from "../models/types";
import { mysqlErrorHdlr } from "../helpers/common";
import { queryCnstrct } from "../helpers/upload";

const NAMESPACE = "CONTROLLERS/UPLOAD";

type ResBody = {
  dataFromExcel: Participant[];
};

// First, upload data to part, next() even if duplicate, as server auto deny
const uploadToTbl = async (
  req: Request<{}, {}, { xlsxData: Participant[]; registeringCourseId: string }>,
  res: Response,
  next: NextFunction
) => {
  let [frstQuery, dontCare] = await queryCnstrct(req.body.registeringCourseId, req.body.xlsxData);

  pool
    .execute(frstQuery)
    .then((queryRes) => {
      logging.info(NAMESPACE, `upload`, { data: req.body.registeringCourseId, course: req.body.xlsxData });
      next();
    })
    .catch((queryErr: MySQLErr) => {
      logging.error(NAMESPACE, "1st part", queryErr);
      if (queryErr.errno === 1062) {
        next();
      }
      // mysqlErrorHdlr(queryErr, res);
    });
};

/**
 * Second, check if first part already registered, if true, dont allow run 3rd
 */
const findOneEntry = async (
  req: Request<{}, {}, { xlsxData: Participant[]; registeringCourseId: string }>,
  res: Response,
  next: NextFunction
) => {
  const query = `SELECT COUNT(1) FROM ${process.env.MYSQL_TBL_3} WHERE course_id = ? AND participant_id = ?`;
  const queryValues = [req.body.registeringCourseId, req.body.xlsxData[0].id];

  pool
    .execute(query, queryValues)
    .then((queryRes) => {
      const [rows, fields] = queryRes; // [ BinaryRow { 'COUNT(1)': 0 } ]
      logging.info(NAMESPACE, "wtf", rows);
      const countRes = JSON.stringify(rows).slice(13, 14); // [ { 'COUNT(1)': 0 } ] -> 0
      if (countRes === "1") {
        // if 1 -> existed -> dont allow write DB
        return res.status(409).json({ msg: `Data duplicate roi hiu hiu` });
      } else {
        next();
      }

      return res.status(200).json(rows);
    })

    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

// Third, cause if 1st part not register yet -> all of them not register
const uploadToRelationTbl = async (
  req: Request<{}, {}, { xlsxData: Participant[]; registeringCourseId: string }>,
  res: Response,
  next: NextFunction
) => {
  let [dontCare, scndQuery] = await queryCnstrct(req.body.registeringCourseId, req.body.xlsxData);

  pool
    .execute(scndQuery)
    .then((queryRes) => {
      logging.info(NAMESPACE, `upload`, { data: req.body.registeringCourseId, course: req.body.xlsxData });
      return res.status(200).json({ msg: `The data from Excel has been uploaded to the DB.` });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, "2nd part", queryErr);
      mysqlErrorHdlr(queryErr, res);
    });
};

export { uploadToTbl, uploadToRelationTbl, findOneEntry };
