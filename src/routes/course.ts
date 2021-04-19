import express from "express";

import { getListMdlwr } from "../middlewares";
import {
  getListRACompatible,
  getOneRACompatible,
  createAndGetOneRACompatible,
  updateAndGetOneRACompatible,
  getOneAndDeleteRACompatible,
} from "../controllers/course";

const courseRouter = express.Router();

//* Participant Resource
// --- GET ---
courseRouter.get("/", getListMdlwr, getListRACompatible);
courseRouter.get("/:id", getOneRACompatible);

// --- POST ---
courseRouter.post("/", createAndGetOneRACompatible);

// --- PUT ---
courseRouter.put("/:id", updateAndGetOneRACompatible);

// --- DELETE ---
courseRouter.delete("/:id", getOneAndDeleteRACompatible);

export { courseRouter };
