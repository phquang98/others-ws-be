import logging from "../helpers/logging";
import dotenv from "dotenv";

import { Participant } from "../models/types";

dotenv.config();
const tbl = process.env.MYSQL_TBL_1;
const relationTbl = process.env.MYSQL_TBL_3;

/**
 * Build a tuple string to be executed.
 * @param courseId The id that determine all students would be registered in
 * @param partData The data of all the student from .xlsx
 */
const queryCnstrct = (courseId: string, partData: Participant[]): Promise<[string, string]> => {
  let frstQuery: string = `INSERT INTO ${tbl} (id, first_name, last_name, dob, email) VALUES`;
  let scndQuery: string = `INSERT INTO ${relationTbl} (course_id, participant_id) VALUES`;

  partData.map((ele, index) => {
    if (index === 0) {
      frstQuery += `("${ele.id}", "${ele.first_name}", "${ele.last_name}", "${ele.dob}", "${ele.email}")`;
    } else {
      frstQuery += `, ("${ele.id}", "${ele.first_name}", "${ele.last_name}", "${ele.dob}", "${ele.email}")`;
    }
  });
  frstQuery += ";";

  partData.map((ele, index) => {
    if (index === 0) {
      scndQuery += `("${courseId}","${ele.id}")`;
    } else {
      scndQuery += `, ("${courseId}","${ele.id}")`;
    }
  });
  scndQuery += ";";

  return new Promise((resolve, reject) => {
    resolve([frstQuery, scndQuery]);
  });
};

/**
 *! Deprecated, for reading file with pathName only
 * Props will be auto assigned based on cell row value + col name.
 */
// const extractDataFromXlsx = (filePath: string, sheetName: string): Participant[] => {
//   const excelParseOpts: ParsingOptions = {
//     cellDates: true, // ExcelDateFormat (5 nums) -> JSDateFormat
//   };

//   const sheet2JsonOpts: Sheet2JSONOpts = {
//     raw: false, // use formatted str, aka w prop
//   };

//   const workBook = xlsx.readFile(filePath, excelParseOpts);
//   const workSheet = workBook.Sheets[sheetName];
//   const dataDump: Participant[] = xlsx.utils.sheet_to_json(workSheet, sheet2JsonOpts);
//   return dataDump;
// };

export { queryCnstrct };
