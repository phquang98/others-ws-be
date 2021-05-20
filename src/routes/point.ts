import express from "express";

import { getListMdlwr } from "../middlewares";

import {
  getListResource,
  getOneResource,
  processGrade,
  createResource,
  deleteResource,
  updateResource
} from "../controllers/point";

const pointRouter = express.Router();

//* Participant Resource
// --- GET ---
pointRouter.get("/", getListMdlwr, getListResource);
pointRouter.get("/:id", getOneResource);

// // --- POST ---
pointRouter.post("/", processGrade, createResource);

// // --- PUT ---
pointRouter.put("/:id", processGrade, updateResource);

// --- DELETE ---
pointRouter.delete("/:id", getOneResource, deleteResource);

export { pointRouter };
