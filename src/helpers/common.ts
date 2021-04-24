import { Response } from "express";

import { EntryInfo, MySQLErr, Participant } from "../models/types";

const calculateFinalGrades = (coef1Tests: number[], coef2Tests?: number[], coef3Tests?: number[]) => {
  const divisor = coef1Tests.length;
  const totalSum = coef1Tests.reduce((accum, curVal) => accum + curVal);
  return (totalSum / divisor).toFixed(3);
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

export { calculateFinalGrades, mysqlErrorHdlr };
