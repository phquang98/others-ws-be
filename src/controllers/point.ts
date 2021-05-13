import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import { Course_Participant, returnQuery } from "../models/types";
import { mysqlErrorHdlr, calTotalPoint } from "../helpers/common";
import { triggerQuery } from "./common";
import logging from "../helpers/logging";
import { notExisted } from "../middlewares";

// ~ File vars

dotenv.config();
const tbl = process.env.MYSQL_TBL_3;

type ReqParams = {
  id: string;
};

type ReqBody = Course_Participant;

type ReqQuery = {
  // default
  _end?: string;
  _order?: "ASC" | "DESC";
  _sort?: string;
  _start?: string;
  id?: string;
  // custom
  course_id?: string;
  customFilter?: string;
};

type ResBodyOne = Course_Participant;
type ResBodyMany = Course_Participant[];

type ResLocals = {
  calculatedGrade?: number;
  deletedId?: string;
  createdId?: string;
  isNext?: boolean;
  keysToReturn?: [string, string, string | undefined]; // used for course_part, as only know course_id and part_id, not the id of the row
};

const NAMESPACE = "CONTROLLER/POINT";

// ~ Methods

//* getList
const getListResource = async (
  req: Request<ReqParams, ResBodyMany, ReqBody, ReqQuery, ResLocals>,
  res: Response<ResBodyMany, ResLocals>
) => {
  let query = `SELECT * FROM ${tbl} ORDER BY ${req.query._sort} ${req.query._order}`;
  if (req.query.course_id) {
    query = `SELECT * FROM ${tbl} WHERE course_id="${req.query.course_id}"`;
  } else if (req.query.customFilter) {
    query = `SELECT * FROM ${tbl} WHERE participant_id = "${req.query.customFilter}"`;
    delete req.query.customFilter;
  }

  try {
    const getListResource: ResBodyMany = await triggerQuery<
      ReqParams,
      ResBodyMany,
      ReqBody,
      ReqQuery,
      ResLocals
    >(req, res, NAMESPACE, "getListResource", query);
    return res.status(200).json(getListResource);
  } catch (error) {
    return res.status(404);
  }
};

//* getOne: THIS WILL ALWAYS BE THE FUCKING LAST MIDDLEWARES IN CRUD OPS
const getOneResource = async (
  req: Request<ReqParams, ResBodyOne, ReqBody, ReqQuery, ResLocals>,
  res: Response<ResBodyOne, ResLocals>,
  next: NextFunction
) => {
  const query = `SELECT * FROM ${tbl} WHERE id = ? `;
  let escapeValues;
  if (res.locals.createdId) {
    escapeValues = [res.locals.createdId]; // used by create mdlwr
  } else {
    escapeValues = [req.params.id]; // used alone
  }

  try {
    const getOneResource: ResBodyOne[] = await triggerQuery<
      ReqParams,
      ResBodyOne,
      ReqBody,
      ReqQuery,
      ResLocals
    >(req, res, NAMESPACE, "getOneResource", query, escapeValues);
    if (req.method === "DELETE") {
      next();
    } else {
      return res.status(200).json(getOneResource[0]);
    }
  } catch (error) {
    return res.status(404);
  }
};

//* processGrade: handles all the shit from FE -> calculate shit -> everything ready to be written to DB
// must provide ResBody, so the last getOne use it
const processGrade = (
  req: Request<ReqParams, ResBodyOne, ReqBody, ReqQuery, ResLocals>,
  res: Response<ResBodyOne, ResLocals>,
  next: NextFunction
) => {
  // !const totalGradeP = calTotalPoint([req.body.assignment_1, req.body.assignment_2, req.body.assignment_3])
  res.locals = {
    calculatedGrade: 75
  };
  next();
};

//* create: processGrade -> create CRUD
const createResource = async (
  req: Request<ReqParams, ResBodyOne, ReqBody, ReqQuery, ResLocals>,
  res: Response<ResBodyOne, ResLocals>
) => {
  const createQuery = `INSERT INTO ${tbl} (course_id, participant_id, assignment_1, assignment_2, assignment_3, exam, grade) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const createEscapeValues = [
    req.body.course_id,
    req.body.participant_id,
    req.body.assignment_1,
    req.body.assignment_2,
    req.body.assignment_3,
    req.body.exam,
    res.locals.calculatedGrade
  ];

  try {
    const createQueryRes: returnQuery = await triggerQuery<
      ReqParams,
      ResBodyOne,
      ReqBody,
      ReqQuery,
      ResLocals
    >(req, res, NAMESPACE, "createResource", createQuery, createEscapeValues);
    res.locals = {
      ...res.locals,
      createdId: createQueryRes.insertId.toString()
    };
    return res.status(200).json({
      id: createQueryRes.insertId,
      course_id: req.body.course_id,
      participant_id: req.body.participant_id,
      assignment_1: req.body.assignment_1,
      assignment_2: req.body.assignment_2,
      assignment_3: req.body.assignment_3,
      exam: req.body.exam,
      grade: res.locals.calculatedGrade
    });
  } catch (error) {
    return res.status(404);
  }
};

//* delete: delete CRUD -> getOne
// because delete SQl dont have insertId -> must save id from req.params and call getOne for RA
const deleteResource = async (
  req: Request<ReqParams, ResBodyOne, ReqBody, ReqQuery, ResLocals>,
  res: Response<ResBodyOne, ResLocals>,
  next: NextFunction
) => {
  const deleteQuery = `DELETE FROM ${tbl} WHERE id = ?`;
  const deleteEscapeValues = [req.params.id];

  try {
    const caccacbuoi = await triggerQuery<
      ReqParams,
      ResBodyOne,
      ReqBody,
      ReqQuery,
      ResLocals
    >(req, res, NAMESPACE, "getOneResource", deleteQuery, deleteEscapeValues);
    console.log("omg", caccacbuoi);
    res.locals = {
      isNext: true,
      deletedId: req.params.id
    };
    next();
  } catch (error) {
    return res.status(404);
  }
};

export {
  getListResource,
  getOneResource,
  processGrade,
  createResource,
  deleteResource
};
