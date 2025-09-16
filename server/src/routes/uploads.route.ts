import { Router } from "express";
import { UploadsHandler } from "../handlers";
import { uploadMiddleware } from "@/middlewares";
import { asyncifyHandler } from "@/utils";

export const uploadsRouter = (uploadsHandler: UploadsHandler) => {
  const router = Router();

  router.post(
    "/",
    uploadMiddleware.fields([
      { name: "stringsFile", maxCount: 1 },
      { name: "classificationsFile", maxCount: 1 },
    ]),
    asyncifyHandler(uploadsHandler.handleUpload)
  );
  router.get("/files", asyncifyHandler(uploadsHandler.getFileNames));
  router.get("/files/:filename", asyncifyHandler(uploadsHandler.getFile));
  router.put("/files/:filename", asyncifyHandler(uploadsHandler.updateFile));

  return router;
};
