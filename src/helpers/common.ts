import { Request, Response } from "express";

import { MySQLErr, Interval, Course_Participant } from "../models/types";

/**
 * Grade calculation algorithm\
 * `usedAss`: the number of used assignments -> usedAss * 10 is the maximum points from assignments\
 * `maxAssPart`: the constant that determined how much assignments are worth -> 100 - maxAssPart = maxExamPart\
 * `assReal`: the amount of points from assignments, always < maxAssPart\
 * `examReal`: the percentage amount of points from exam, from 0-100\
 * `totalP`: points from assP and examP\
 * `assP`: assReal/(usedAss * 10) * maxAssPart\
 * `examP`: (examReal/100) * (100 - maxAssPart)\
 * now use `totalP` -> compare to upper limit -> got grades
 */
const calTotalPoint = (
  assPointClt: number[],
  usedAss: number,
  maxAssPart: number,
  examReal: number
) => {
  const assReal = assPointClt.reduce((accum, curVal) => accum + curVal);
  const assP = (assReal / (usedAss * 10)) * maxAssPart;
  const examP = (examReal / 100) * (100 - maxAssPart);
  const totalP = assP + examP;
  return Math.round(totalP);
};

// Construct the SQL based on how many assignments used for grade cal
const assQueryBuilder = (tableName: string | undefined, usedAss: number) => {
  let insertField = "";
  let insertQuestionMark = "";
  for (let index = 1; index <= usedAss; index++) {
    if (index === usedAss) {
      insertField += `assignment_${index}`;
      insertQuestionMark += `?`;
    } else {
      insertField += `assignment_${index}, `;
      insertQuestionMark += `?, `;
    }
  }
  const fullQuery = `INSERT INTO ${tableName} (course_id, participant_id, ${insertField}, exam, grade) VALUES (?, ?, ${insertQuestionMark}, ?, ?)`;
  return fullQuery;
};

const assQueryBuilderUpdate = (
  tableName: string | undefined,
  usedAss: number
) => {
  let insertField = "";
  for (let index = 1; index <= usedAss; index++) {
    insertField += `assignment_${index} = ?, `;
  }

  const fullUpdateQuery = `UPDATE ${tableName} SET ${insertField}exam = ?, grade = ? WHERE id = ?`;
  return fullUpdateQuery;
};

// ! very bad code
type ResLocals = {
  calculatedGrade?: number;
  deletedId?: string;
  createdId?: string;
  isNext?: boolean;
  keysToReturn?: [string, string, string | undefined]; // used for course_part, as only know course_id and part_id, not the id of the row
  used_ass: number;
  max_point_ass?: string;
  interval?: Interval;
};

type ReqParams = {
  id: string;
};

const escapeValuesBuilder = (
  req: Request<any, any, Course_Participant, any, ResLocals>,
  res: Response<any, ResLocals>
) => {
  const startEscapeValues: (string | number | undefined)[] = [
    req.body.course_id,
    req.body.participant_id
  ];
  const endEscapeValues = [req.body.exam, res.locals.calculatedGrade];
  const assEscapeValues = [
    req.body.assignment_1,
    req.body.assignment_2,
    req.body.assignment_3,
    req.body.assignment_4,
    req.body.assignment_5,
    req.body.assignment_6,
    req.body.assignment_7,
    req.body.assignment_8,
    req.body.assignment_9,
    req.body.assignment_10
  ].slice(0, res.locals.used_ass);
  return startEscapeValues.concat(assEscapeValues).concat(endEscapeValues);
};

const escapeValuesBuilderUpdate = (
  req: Request<ReqParams, any, Course_Participant, any, ResLocals>,
  res: Response<any, ResLocals>
) => {
  const endEscapeValues = [
    req.body.exam,
    res.locals.calculatedGrade,
    req.params.id
  ];
  const startEscapeValues = [
    req.body.assignment_1,
    req.body.assignment_2,
    req.body.assignment_3,
    req.body.assignment_4,
    req.body.assignment_5,
    req.body.assignment_6,
    req.body.assignment_7,
    req.body.assignment_8,
    req.body.assignment_9,
    req.body.assignment_10
  ].slice(0, res.locals.used_ass);
  return startEscapeValues.concat(endEscapeValues);
};

const newCalFinalGrades = (
  gradeBeforeEvalute: number,
  interval: Interval
): number => {
  // ass1: 5/10
  // ass: 7/10
  // ass3: 4/10
  // exam: 9/10
  // total: 5 + 7 + 4 + 9 = 25/40 -> 60% -> grade 3

  // ! i give you 10 ass
  // ! teacher wants 7 ass -> max 70p tu ass
  // ! max baitap 30 -> max exam 70
  // ! 57p from ass -> 57/70 *30 = 24.42p/30p bai tap
  // ! 84% -> 84%* 70 = 58.8p tu exam
  // ! 24.42 + 58.8 = 83.22p / 100p

  // i give u 20 ass, igve 10

  // teacher give you 12 assign -> 3ass redundant
  // student returns 10 ass, total point 80
  // max ass 40, max exam 60// ->
  // student ass score 80/120 -> 66.7% * 40 = 26.68p
  // exam 80% -> 80% * 60 = 48p
  // total: 48p + 26.68p = 74.67p / 100p ->  grade from this data

  // teacher give 10 ass
  // student returns 8 ass, total point 75
  // student score 75/100 -> 75% * 40 = 30p
  // exam 60/100 -> 60% * 60 = 36p
  // final: 30 + 36 = 66p
  // <35 -> 0 grade

  // ? variables
  // how many ass
  // max ass, max exam -> e.g max ass 30 -> max exam 70
  //

  // pass 33
  // grade 1 upper limit 45
  // grade 2 up limit 60
  // grade 3 up limit 75
  // grade 4 up limit 90
  // student 45 -> grade 1
  // student grade 60 -> grade 2
  // student grade 50 -> grade 1
  console.log("cai loz", gradeBeforeEvalute);
  console.log("cai cac", interval);

  if (gradeBeforeEvalute < interval[0]) {
    return 0;
  } else if (
    gradeBeforeEvalute >= interval[0] &&
    gradeBeforeEvalute < interval[1]
  ) {
    return 1;
  } else if (
    gradeBeforeEvalute >= interval[1] &&
    gradeBeforeEvalute < interval[2]
  ) {
    return 2;
  } else if (
    gradeBeforeEvalute >= interval[2] &&
    gradeBeforeEvalute < interval[3]
  ) {
    return 3;
  } else if (
    gradeBeforeEvalute >= interval[3] &&
    gradeBeforeEvalute < interval[4]
  ) {
    return 4;
  } else {
    return 5;
  }
};

enum MySQLErrorNum {
  DUPLICATE_ENTRY = 1062,
  FOREIGN_KEY_NOT_EXISTED = 1452
}

// TODO continue writing this
// const cnstrctEntryInfo = <T extends EntryInfo>(entryArr: string[], typeToBe: string): T => {
//   switch (typeToBe) {
//     case "Participant":
//       const tmp: Participant = {
//         id:
//       }
//       return
//       break;
//     default:
//       break;
//   }
// };

// const mysqlErrorHdlr = (queryErr: MySQLErr, entryInfo: EntryInfo) => {
//   if ("last_name" in entryInfo) {
//     console.log("typeguard Participant");
//   } else if ("course_title" in entryInfo) {
//     console.log("typeguard Course");
//   } else {
//     console.log("typeguard C-P");
//   }
// };

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

export {
  mysqlErrorHdlr,
  newCalFinalGrades,
  calTotalPoint,
  assQueryBuilder,
  assQueryBuilderUpdate,
  escapeValuesBuilder,
  escapeValuesBuilderUpdate
};
