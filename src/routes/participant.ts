import express from "express";

import { getListMdlwr } from "../middlewares";
import { uploadToTbl, uploadToRelationTbl, findOneEntry } from "../controllers/upload";
import {
  getListRACompatible,
  getOneRACompatible,
  createAndGetOneRACompatible,
  updateAndGetOneRACompatible,
  getOneAndDeleteRACompatible,
} from "../controllers/participant";

const participantRouter = express.Router();

//* Participant Resource
// --- GET ---
participantRouter.get("/", getListMdlwr, getListRACompatible);
participantRouter.get("/:id", getOneRACompatible);

// --- POST ---
participantRouter.post("/", createAndGetOneRACompatible);
participantRouter.post("/upload", uploadToTbl, findOneEntry, uploadToRelationTbl);

// --- PUT ---
participantRouter.put("/:id", updateAndGetOneRACompatible);

// --- DELETE ---
participantRouter.delete("/:id", getOneAndDeleteRACompatible);

//* Course Resource

//* Course-Participant Resource

export { participantRouter };
