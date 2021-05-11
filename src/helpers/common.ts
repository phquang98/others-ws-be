import { Response } from "express";

import { MySQLErr, Interval } from "../models/types";

const calculateFinalGrades = (coef1Tests: number[], coef2Tests?: number[], coef3Tests?: number[]) => {
  const divisor = coef1Tests.length;
  const totalSum = coef1Tests.reduce((accum, curVal) => accum + curVal);
  return (totalSum / divisor).toFixed(3);
};

const newCalFinalGrades = (ptArr: number[], interval: Interval): number => {
  const total = ptArr.reduce((accum, curVal) => accum + curVal);

  // ass1: 5/10
  // ass: 7/10
  // ass3: 4/10
  // exam: 9/10
  // total: 5 + 7 + 4 + 9 = 25/40 -> 60% -> grade 3

  //! i give you 10 ass
  //! teacher wants 7 ass -> max 70p tu ass
  //! max baitap 30 -> max exam 70
  //! 57p from ass -> 57/70 *30 = 24.42p/30p bai tap
  //! 84% -> 84%* 70 = 58.8p tu exam
  //! 24.42 + 58.8 = 83.22p / 100p

  // i give u 20 ass, igve 10

  // teacher give you 12 assign -> 3ass redundant
  // student returns 10 ass, total point 80
  // max ass 40, max exam 60// ->
  // student ass score 80/120 -> 66.7% * 40 = 26.68p
  // exam 80% -> 80% * 60 = 48p
  // total: 48p + 26.68p = 74.67p / 100p ->  grade from this data

  // teacher give 10 ass
  //student returns 8 ass, total point 75
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

  console.log("o common", total);
  console.log("o common", interval[4]);

  if (total < interval[0]) {
    return 0;
  } else if (total >= interval[0] && total < interval[1]) {
    return 1;
  } else if (total >= interval[1] && total < interval[2]) {
    return 2;
  } else if (total >= interval[2] && total < interval[3]) {
    return 3;
  } else if (total >= interval[3] && total < interval[4]) {
    return 4;
  } else {
    return 0;
  }
};

enum MySQLErrorNum {
  DUPLICATE_ENTRY = 1062,
  FOREIGN_KEY_NOT_EXISTED = 1452,
}

//TODO continue writing this
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
      return res.status(409).json({ message: `Key value is duplicated. Please change key value.` });
    case MySQLErrorNum.FOREIGN_KEY_NOT_EXISTED:
      return res.status(409).json({ message: `Key value not existed. Please change key value.` });
    default:
      console.log("Switch key value is empty!");
      return res.status(400).json({ message: `Some error has occured!` });
  }
};

export { calculateFinalGrades, mysqlErrorHdlr, newCalFinalGrades };
