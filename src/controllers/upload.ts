import { Request, Response, NextFunction } from "express";

import logging from "../helpers/logging";
import { PromisablePoolCXN as pool } from "../helpers/mysql";
import { Participant } from "../models/types";
import { mysqlErrorHdlr } from "../helpers/common";
import { queryCnstrct } from "../helpers/upload";

const NAMESPACE = "CONTROLLERS/UPLOAD";

type ResBody = {
  dataFromExcel: Participant[];
};

// First, upload data to part
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
    .catch((queryErr) => {
      logging.error(NAMESPACE, "1st part", queryErr);
      mysqlErrorHdlr(queryErr, res);
    });
};

// Second, upload data to course_part
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

export { uploadToTbl, uploadToRelationTbl };
