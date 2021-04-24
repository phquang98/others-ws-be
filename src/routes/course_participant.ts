import express from "express";

import { getListMdlwr } from "../middlewares";
import {
  getListRACompatible,
  getOneRACompatible,
  createAndGetOneRACompatible,
  updateAndGetOneRACompatible,
  getOneAndDeleteRACompatible,
} from "../controllers/course_participant";

const course_partRouter = express.Router();

//* Participant Resource
// --- GET ---
course_partRouter.get("/", getListMdlwr, getListRACompatible);
course_partRouter.get("/:id", getOneRACompatible);

// --- POST ---
course_partRouter.post("/", createAndGetOneRACompatible);

// --- PUT ---
course_partRouter.put("/:id", updateAndGetOneRACompatible);

// --- DELETE ---
course_partRouter.delete("/:id", getOneAndDeleteRACompatible);

export { course_partRouter };
