import { Request, Response, NextFunction } from "express";

import logging from "../config/logging";
import { dbOps } from "../config/mysql";
import { extractDataFromXlsx, xlsxQueryConstructor } from "../middlewares/upload";
import { Participant } from "../models/types";

const NAMESPACE = "CONTROLLERS";

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
