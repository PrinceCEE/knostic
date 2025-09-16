import express from "express";
import cors from "cors";

import { UploadsHandler } from "./handlers";
import { uploadsRouter } from "./routes";
import { Config } from "./config";
import { Logger } from "./logger";
import { CSVService } from "./services";

function main() {
  const config = new Config();
  const csvService = new CSVService();
  const logger = new Logger(config);
  const app = express();

  const uploadHandler = new UploadsHandler(logger, csvService);
  const uploadRouter = uploadsRouter(uploadHandler);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/csv", uploadRouter);

  app.listen(config.port, () => {
    logger.info(`App listening on port ${config.port}`);
  });
}

main();
