import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import {
  Course,
  Course_Participant,
  Interval,
  returnQuery
} from "../models/types";
import {
  calTotalPoint,
  assQueryBuilder,
  assQueryBuilderUpdate,
  escapeValuesBuilder,
  newCalFinalGrades,
  escapeValuesBuilderUpdate
} from "../helpers/common";
import { triggerQuery } from "./common";
import logging from "../helpers/logging";

// ~ File vars

dotenv.config();
const tbl = process.env.MYSQL_TBL_3;
const tbl2 = process.env.MYSQL_TBL_2;

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
  used_ass: number;
  max_point_ass?: string;
  interval?: Interval;
  assP?: number;
  examP?: number;
  total?: number;
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
const processGrade = async (
  req: Request<ReqParams, ResBodyOne, ReqBody, ReqQuery, ResLocals>,
  res: Response<ResBodyOne, ResLocals>,
  next: NextFunction
) => {
  const queryDataForGrade = `SELECT * FROM ${tbl2} WHERE id = ?`;
  const escapeValues = [req.body.course_id];

  try {
    const dataForCalGrade: Course[] = await triggerQuery<
      ReqParams,
      ResBodyOne,
      ReqBody,
      ReqQuery,
      ResLocals
    >(req, res, NAMESPACE, "processGrade", queryDataForGrade, escapeValues);
    // res.locals = {
    //   used_ass: dataForCalGrade[0].used_assignments,
    //   max_point_ass: dataForCalGrade[0].max_assignment_point,
    //   interval: [
    //     Number(dataForCalGrade[0].grade1_interval),
    //     Number(dataForCalGrade[0].grade2_interval),
    //     Number(dataForCalGrade[0].grade3_interval),
    //     Number(dataForCalGrade[0].grade4_interval),
    //     Number(dataForCalGrade[0].grade5_interval)
    //   ],
    //   calculatedGrade: 75
    // };
    const gradeBeforeEvaluate = calTotalPoint(
      [
        Number(req.body.assignment_1),
        Number(req.body.assignment_2),
        Number(req.body.assignment_3),
        Number(req.body.assignment_4),
        Number(req.body.assignment_5),
        Number(req.body.assignment_6),
        Number(req.body.assignment_7),
        Number(req.body.assignment_8),
        Number(req.body.assignment_9),
        Number(req.body.assignment_10)
      ].slice(0, dataForCalGrade[0].used_assignments),
      dataForCalGrade[0].used_assignments,
      Number(dataForCalGrade[0].max_assignment_point),
      Number(req.body.exam)
    );
    res.locals = {
      calculatedGrade: newCalFinalGrades(gradeBeforeEvaluate[0], [
        dataForCalGrade[0].grade1_interval,
        dataForCalGrade[0].grade2_interval,
        dataForCalGrade[0].grade3_interval,
        dataForCalGrade[0].grade4_interval,
        dataForCalGrade[0].grade5_interval
      ]),
      used_ass: dataForCalGrade[0].used_assignments,
      total: gradeBeforeEvaluate[0],
      examP: gradeBeforeEvaluate[1],
      assP: gradeBeforeEvaluate[2]
    };
    // return res.status(200).json({ goodshit: res.locals, goldenShit });
    next();
  } catch (error) {
    return res.status(404);
  }
};

//* create: processGrade -> create CRUD
const createResource = async (
  req: Request<ReqParams, ResBodyOne, ReqBody, ReqQuery, ResLocals>,
  res: Response<ResBodyOne, ResLocals>
) => {
  const newCreateQuery = assQueryBuilder(tbl, res.locals.used_ass);
  console.log(newCreateQuery);
  const newEscapeValues = escapeValuesBuilder(req, res);
  logging.info(NAMESPACE, "important", { newCreateQuery, newEscapeValues });

  try {
    const createQueryRes: returnQuery = await triggerQuery<
      ReqParams,
      ResBodyOne,
      ReqBody,
      ReqQuery,
      ResLocals
    >(req, res, NAMESPACE, "createResource", newCreateQuery, newEscapeValues);
    res.locals = {
      ...res.locals,
      createdId: createQueryRes.insertId.toString()
    };
    return res.status(200).json({
      id: createQueryRes.insertId,
      course_id: req.body.course_id,
      participant_id: req.body.participant_id,
      grade: res.locals.calculatedGrade,
      total: res.locals.total,
      exam_point: res.locals.examP,
      exam: req.body.exam,
      assignment_point: res.locals.assP,
      assignment_1: req.body.assignment_1,
      assignment_2: req.body.assignment_2,
      assignment_3: req.body.assignment_3,
      assignment_4: req.body.assignment_4,
      assignment_5: req.body.assignment_5,
      assignment_6: req.body.assignment_6,
      assignment_7: req.body.assignment_7,
      assignment_8: req.body.assignment_8,
      assignment_9: req.body.assignment_9,
      assignment_10: req.body.assignment_10
    });
  } catch (error) {
    return res.status(404);
  }
};

const updateResource = async (
  req: Request<ReqParams, ResBodyOne, ReqBody, ReqQuery, ResLocals>,
  res: Response<ResBodyOne, ResLocals>,
  next: NextFunction
) => {
  const newUpdateQuery = assQueryBuilderUpdate(tbl, res.locals.used_ass);
  const updateEscapeValues = escapeValuesBuilderUpdate(req, res);
  logging.info(NAMESPACE, "important", { newUpdateQuery, updateEscapeValues });

  try {
    const updateQueryRes = await triggerQuery<
      ReqParams,
      ResBodyOne,
      ReqBody,
      ReqQuery,
      ResLocals
    >(
      req,
      res,
      NAMESPACE,
      "updateResource",
      newUpdateQuery,
      updateEscapeValues
    );
    return res.status(200).json({
      id: updateQueryRes.insertId,
      course_id: req.body.course_id,
      participant_id: req.body.participant_id,
      grade: res.locals.calculatedGrade,
      total: res.locals.total,
      exam_point: res.locals.examP,
      exam: req.body.exam,
      assignment_1: req.body.assignment_1,
      assignment_2: req.body.assignment_2,
      assignment_3: req.body.assignment_3,
      assignment_4: req.body.assignment_4,
      assignment_5: req.body.assignment_5,
      assignment_6: req.body.assignment_6,
      assignment_7: req.body.assignment_7,
      assignment_8: req.body.assignment_8,
      assignment_9: req.body.assignment_9,
      assignment_10: req.body.assignment_10
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
  updateResource,
  deleteResource
};
