import express from "express";

import {
  getAllPersons,
  getPersonByPersonID,
  createPerson,
  editPersonByPersonID,
  deletePersonByPersonID,
  uploadXlsxDataToDB,
  deletePersonByID,
  getListRACompatible,
  getOneRACompatible,
  createAndGetOneRACompatible,
  updateAndGetOneRACompatible,
  getOneAndDeleteRACompatible,
} from "../controllers/participant";
import { getListMdlwr } from "../middlewares/";

const participantRouter = express.Router();

//* Participant Resource
// --- GET ---
// participantRouter.get("/", getListMdlwr, getListRACompatible);
// participantRouter.get("/:id", getPersonByPersonID);
participantRouter.get("/", getListMdlwr, getListRACompatible); //
participantRouter.get("/:id", getOneRACompatible);

// --- POST ---
// participantRouter.post("/", createPerson);
participantRouter.post("/", createAndGetOneRACompatible);
participantRouter.post("/upload", uploadXlsxDataToDB); // maybe send the filePath from req.body ??

// --- PUT ---
// participantRouter.put("/:id", editPersonByPersonID, getPersonByPersonID);
participantRouter.put("/:id", updateAndGetOneRACompatible);

// --- DELETE ---
// participantRouter.delete("/:id", deletePersonByID);
participantRouter.delete("/:id", getOneAndDeleteRACompatible);

//* Course Resource

//* Course-Participant Resource

export { participantRouter };
