import xlsx, { ParsingOptions, Sheet2JSONOpts } from "xlsx";
import logging from "../helpers/logging";

import { Participant } from "../models/types";

/**
 * Returns a query that can be used for multiple insertion to be the database.
 * Add it after the SQL `VALUES` keyword
 */
const xlsxQueryConstructor = (data: Participant[]): Promise<string> => {
  let queryValues: string = "";
  // logging.info("UPLOAD", "From Excel:", data);
  data.map((ele, index) => {
    if (index === 0) {
      queryValues += `( "${Number(ele.id)}", "${ele.first_name}", "${ele.last_name}", "${ele.dob}", "${ele.email}")`;
    } else {
      queryValues += `, ( "${Number(ele.id)}", "${ele.first_name}", "${ele.last_name}", "${ele.dob}", "${ele.email}")`;
    }
  });
  queryValues += ";";

  return new Promise((resolve, reject) => {
    if (queryValues !== "") {
      resolve(queryValues);
    } else {
      logging.error("UPLOAD", "Query VALUES constructed wrong!");
      reject();
    }
  });
};

export { xlsxQueryConstructor };
