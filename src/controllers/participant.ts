import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import logging from "../config/logging";
import { dbOps, PromisablePoolCXN as pool } from "../config/mysql";
import { xlsxQueryConstructor } from "../middlewares/upload";
import { Participant } from "../models/types";

const NAMESPACE = "CONTROLLERS/PART";

dotenv.config();
const tbl = process.env.MYSQL_TBL_1;

type ReqParams = {
  id?: number;
};

// --- NEW SHIT ---

const getListRACompatible = (req: Request, res: Response<Participant[]>, next: NextFunction) => {
  let query = `SELECT * FROM ${tbl}`;

  // pool.getConnection().then((cxn) => {
  //   cxn
  //     .execute(query)
  //     .then((queryRes) => {
  //       logging.info(NAMESPACE, `getAll`, req.params);
  //       const [rows, fields] = queryRes; //TODO
  //       const getListRes: Array<Participant> = JSON.parse(JSON.stringify(rows)); //TODO
  //       cxn.release();
  //       return res.status(200).json(getListRes);
  //     })
  //     .catch((queryErr) => {
  //       logging.error(NAMESPACE, queryErr.message, queryErr);
  //     });
  // });

  pool
    .execute(query)
    .then((queryRes) => {
      logging.info(NAMESPACE, `getAll`, req.params);
      const [rows, fields] = queryRes; //TODO
      const getListRes: Array<Participant> = JSON.parse(JSON.stringify(rows)); //TODO
      return res.status(200).json(getListRes);
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const getOneRACompatible = (req: Request<ReqParams>, res: Response<Participant>, next: NextFunction) => {
  let query = `SELECT * FROM ${tbl} WHERE id = ? `;
  let escapeValues = [req.params.id];

  pool
    .execute(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `getOne`, req.params);
      const [rows, fields] = queryRes;
      const getOneRes: Participant[] = JSON.parse(JSON.stringify(rows));
      return res.status(200).json(getOneRes[0]);
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const createAndGetOneRACompatible = (
  req: Request<ReqParams, {}, Participant>,
  res: Response<Participant>,
  next: NextFunction
) => {
  let createQuery = `INSERT INTO ${tbl} (id, first_name, last_name, participant_id, dob, email) 
  VALUES (?, ?, ?, ?, ?, ?)`;
  let createEscapeValues = [
    req.body.id,
    req.body.first_name,
    req.body.last_name,
    req.body.participant_id,
    req.body.dob,
    req.body.email,
  ];
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.body.id]; // BE create -> BE getOne, NOT BE create -> FE GET part/:id -> BE getOne -> DONT KNOW THE ID

  pool
    .execute(createQuery, createEscapeValues)
    .then(() => {
      logging.info(NAMESPACE, `create`, req.body);
      pool
        .execute(getQuery, getEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `getOne`, req.params);
          const [rows, fields] = queryRes;
          const createRes: Participant[] = JSON.parse(JSON.stringify(rows));
          return res.status(200).json(createRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr); //
    });
};

const updateAndGetOneRACompatible = (
  req: Request<ReqParams, {}, Participant>,
  res: Response<Participant>,
  next: NextFunction
) => {
  let updateQuery = `UPDATE ${tbl} SET first_name = ?, last_name = ?, participant_id = ?, dob = ?, email = ? WHERE id = ?`;
  let updateEscapeValues = [
    req.body.first_name,
    req.body.last_name,
    req.body.participant_id,
    req.body.dob.slice(0, 10), //
    req.body.email,
    req.params.id,
  ];
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];

  pool
    .execute(updateQuery, updateEscapeValues)
    .then(() => {
      logging.info(NAMESPACE, `update`, req.body);
      pool
        .execute(getQuery, getEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `getOne`, req.params);
          const [rows, fields] = queryRes;
          const updateRes: Participant[] = JSON.parse(JSON.stringify(rows));
          return res.status(200).json(updateRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const getOneAndDeleteRACompatible = (req: Request<ReqParams>, res: Response<Participant>, next: NextFunction) => {
  //! getOne + delete to comply RA Response Format, maybe retarded
  const getQuery = `SELECT * FROM ${tbl} WHERE id = ? `;
  const getEscapeValues = [req.params.id];
  let deleteQuery = `DELETE FROM ${tbl} WHERE id = ?`;
  let deleteEscapeValues = [req.params.id];
  let deleteRes: Participant[];

  pool
    .execute(getQuery, getEscapeValues) //
    .then((queryRes) => {
      logging.info(NAMESPACE, `getOne from delete`, req.params);
      const [rows, fields] = queryRes;
      deleteRes = JSON.parse(JSON.stringify(rows)); // retain the entity to return to FE later
      pool
        .execute(deleteQuery, deleteEscapeValues)
        .then((queryRes) => {
          logging.info(NAMESPACE, `delete`, req.params);
          return res.status(200).json(deleteRes[0]);
        })
        .catch((queryErr) => {
          logging.error(NAMESPACE, queryErr.message, queryErr);
        });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

// --- OLD SHIT ---

const getAllPersons = (req: Request, res: Response, next: NextFunction) => {
  let query = `SELECT * FROM ${tbl}`;

  dbOps(query)
    .then((queryRes) => {
      logging.info(NAMESPACE, `getAll`, req.params);
      const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      return res.status(200).json(rows);
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const getPersonByPersonID = (req: Request<ReqParams>, res: Response, next: NextFunction) => {
  let query = `SELECT * FROM ${tbl} WHERE id = ? `;
  let escapeValues = [req.params.id]; //

  dbOps(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `getOne`, req.params);
      const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      const getOneRes: Array<Participant> = JSON.parse(JSON.stringify(rows)); // removes the BinaryRow name, see https://github.com/mysqljs/mysql/issues/1899
      return res.status(200).json(...getOneRes); // must comply with RA `getOne` -> return an obj only
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    }); //
};

const createPerson = (req: Request<ReqParams, {}, Participant>, res: Response, next: NextFunction) => {
  let query = `INSERT INTO ${tbl} (id, first_name, last_name, participant_id, dob, email) 
  VALUES (?, ?, ?, ?, ?, ?)`;
  let escapeValues = [
    req.body.id,
    req.body.first_name,
    req.body.last_name,
    req.body.participant_id,
    req.body.dob,
    req.body.email,
  ];

  dbOps(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `Connected to DB OK`);
      const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      return res.status(200).json({ msg: `Entry with ${req.body.participant_id} has been created.` });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const editPersonByPersonID = (req: Request<ReqParams, {}, Participant>, res: Response, next: NextFunction) => {
  let query = `UPDATE ${tbl} SET first_name = ?, last_name = ?, participant_id = ?, dob = ?, email = ? WHERE id = ?`;
  let escapeValues = [
    req.body.first_name,
    req.body.last_name,
    req.body.participant_id,
    req.body.dob.slice(0, 10), //
    req.body.email,
    req.params.id, //
  ];
  const query2nd = `SELECT * FROM ${tbl} WHERE id = ? `;
  let escapeValues2nd = [req.params.id]; //

  dbOps(query, escapeValues)
    .then((queryRes) => {
      // logging.info(NAMESPACE, `update`, req.params);
      // const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      // console.log(rows);
      // const updateRes: Array<Participant> = JSON.parse(JSON.stringify(rows));
      // return res.status(200).json(...updateRes);
      next();
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const editPersonByPersonName = (req: Request<ReqParams, {}, Participant>, res: Response, next: NextFunction) => {
  let query = `UPDATE ${tbl} SET id = ?, first_name = ?, participant_id = ?, dob = ?, email = ? WHERE last_name = ?`;
  let escapeValues = [
    req.body.id,
    req.body.first_name,
    req.body.participant_id,
    req.body.dob,
    req.body.email,
    req.body.last_name,
  ]; //

  dbOps(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `Connected to DB OK`);
      const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      return res.status(200).json({ msg: `Entry with ${req.body.last_name} has been updated.` });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const deletePersonByID = (req: Request<ReqParams>, res: Response, next: NextFunction) => {
  let query = `DELETE FROM ${tbl} WHERE id = ?`;
  let escapeValues = [req.params.id];

  dbOps(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `Connected to DB OK`);
      const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      return res.status(200).json({ msg: `Entry with ${req.params.id} has been deleted.` });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const deletePersonByPersonID = (req: Request<ReqParams>, res: Response, next: NextFunction) => {
  let query = `DELETE FROM ${tbl} WHERE participant_id = ?`;
  let escapeValues = [req.params.id];

  dbOps(query, escapeValues)
    .then((queryRes) => {
      logging.info(NAMESPACE, `Connected to DB OK`);
      const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      return res.status(200).json({ msg: `Entry with ${req.params.id} has been deleted.` });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

// maybe SQL injection vulnerable here
const uploadXlsxDataToDB = async (req: Request<{}, {}, Participant[]>, res: Response, next: NextFunction) => {
  let queryValues = await xlsxQueryConstructor(req.body);
  let query = `INSERT INTO ${tbl} (first_name, last_name, participant_id, dob, email) VALUES ${queryValues}`;
  console.log(query);

  dbOps(query)
    .then((queryRes) => {
      logging.info(NAMESPACE, `Connected to DB OK`);
      const [rows, fields] = queryRes; // only cares about the row data -> arr destrct
      return res.status(200).json({ msg: `The data from Excel has been uploaded to the DB.` });
    })
    .catch((queryErr) => {
      logging.error(NAMESPACE, queryErr.message, queryErr);
    });
};

const template = (req: Request, res: Response, next: NextFunction) => {}; //

export {
  getAllPersons,
  getPersonByPersonID,
  createPerson,
  editPersonByPersonID,
  deletePersonByID,
  deletePersonByPersonID,
  uploadXlsxDataToDB,
  getListRACompatible,
  getOneRACompatible,
  createAndGetOneRACompatible,
  updateAndGetOneRACompatible,
  getOneAndDeleteRACompatible,
};
