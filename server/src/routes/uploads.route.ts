import { Router } from "express";
import { UploadsHandler } from "../handlers";

export const uploadsRouter = (uploadsHandler: UploadsHandler) => {
  const router = Router();

  return router;
};
