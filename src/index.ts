import express from "express";
import cors from "cors";

import logging from "./helpers/logging";
import config from "./helpers/config";
import { participantRouter } from "./routes/participant";
import { topLog, notExisted } from "./middlewares";
import { courseRouter } from "./routes/course";
import { course_partRouter } from "./routes/course_participant";

const app = express();

//* --- Top Lv Middlewares ---

app.use(express.json());
app.use(topLog);
app.use(cors());

//* --- Routing ---

app.use("/participant", participantRouter);
app.use("/course", courseRouter);
app.use("/course_participant", course_partRouter);

//* --- Error Middlewares ---

app.use(notExisted);

//* --- Entry point ---

app.listen(config.server.port, () =>
  logging.info(`App`, `Server running on ${config.server.hostname}:${config.server.port}`)
);
