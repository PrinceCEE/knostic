import { Request, Response, NextFunction } from "express";

import { HandlerFn, IResponse } from "@/types";
import { BaseHttpException } from "@/errors";

export const asyncifyHandler = (fn: HandlerFn) => {
  return (req: Request, res: Response, nex: NextFunction) => {
    fn(req, res)
      .then((data) => {
        if (data) {
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        const response: IResponse = {
          success: false,
          message: "Error",
          error: err.message,
        };
        res
          .status(err instanceof BaseHttpException ? err.statusCode : 500)
          .json(response);
      });
  };
};
