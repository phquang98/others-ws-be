import express from "express";
import raRest from "ra-data-simple-rest";
import cors from "cors";

import logging from "./config/logging";
import config from "./config/config";
import { participantRouter } from "./routes/participant";
import { topLog, notExisted } from "./middlewares";
import { courseRouter } from "./routes/course";

const app = express();

//* --- Top Lv Middlewares ---

app.use(express.json());
app.use(topLog);
app.use(cors());

//* --- Routing ---

app.use("/participant", participantRouter);
app.use("/course", courseRouter);

//* --- Error Middlewares ---

app.use(notExisted);

//* --- Entry point ---

app.listen(config.server.port, () =>
  logging.info(`App`, `Server running on ${config.server.hostname}:${config.server.port}`)
);
