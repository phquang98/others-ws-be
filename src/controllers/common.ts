import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import logging from "../helpers/logging";
import { PromisablePoolCXN as pool } from "../helpers/mysql";
import { MySQLErr, Participant } from "../models/types";
import { mysqlErrorHdlr } from "../helpers/common";

//* Typings

type ReqParams = {
  id: string;
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
