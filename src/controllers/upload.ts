import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import logging from "../helpers/logging";
import { dbOps } from "../helpers/mysql";
import { xlsxQueryConstructor } from "../middlewares/upload";
import { MySQLErr, Participant } from "../models/types";
import { mysqlErrorHdlr } from "../helpers/common";

const NAMESPACE = "CONTROLLERS";

dotenv.config();
const tbl = process.env.MYSQL_TBL_1;

type ResBody = {
  dataFromExcel: Participant[];
};

const uploadDataToServer = (req: Request<{}, {}, ResBody>, res: Response, next: NextFunction) => {
  if (req.body.dataFromExcel) {
    return res.status(200).json({ msg: `Extract from Excel OK!` });
  } else {
    return res.status(200).json({ msg: `Nothing!` });
  }
};

// maybe SQL injection vulnerable here
const uploadXlsxDataToDB = async (req: Request<{}, {}, Participant[]>, res: Response, next: NextFunction) => {
  let queryValues = await xlsxQueryConstructor(req.body);
  let query = `INSERT INTO ${tbl} (id, first_name, last_name, participant_id, dob, email) VALUES ${queryValues}`;
  console.log(query);

  dbOps(query)
    .then((queryRes) => {
      logging.info(NAMESPACE, `Connected to DB OK`);
      const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      return res.status(200).json({ msg: `The data from Excel has been uploaded to the DB.` });
    })
    .catch((queryErr: MySQLErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
      mysqlErrorHdlr(queryErr, res);
    });
};

export { uploadXlsxDataToDB };
