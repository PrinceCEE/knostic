import express from "express";
import cors from "cors";
import path from "node:path";

import { UploadsHandler } from "./handlers";
import { uploadsRouter } from "./routes";
import { config } from "./config";
import { logger } from "./logger";

function main() {
  const app = express();

  const uploadHandler = new UploadsHandler();
  const uploadRouter = uploadsRouter(uploadHandler);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/uploads", express.static(path.join(__dirname, "./uploads")));
  app.use("/api/csv", uploadRouter);

  app.listen(config.port, () => {
    logger.info(`App listening on port ${config.port}`);
  });
}

main();
