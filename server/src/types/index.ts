import { Request, Response } from "express";

export type LogLevel = "info" | "warn" | "error" | "debug" | "trace";

export type UploadFiles = {
  stringsFile: Express.Multer.File[];
  classificationsFile: Express.Multer.File[];
};

export type IResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export type UploadResponse = IResponse<{
  stringsData?: StringsData[];
  classificationsData?: ClassificationsData[];
}>;

export type HandlerFn = (
  req: Request,
  res: Response
) => Promise<IResponse | void>;

export type ClassificationsData = {
  Topic: string;
  SubTopic: string;
  Industry: string;
  Classification: string;
};

export type StringsData = {
  Tier: string;
  Industry: string;
  Topic: string;
  Subtopic: string;
  Prefix: string;
  "Fuzzing-Idx": string;
  Prompt: string;
  Risks: string;
  Keywords: string;
};

export type RowValidationError = {
  index: number;
  row: StringsData | ClassificationsData;
  error: string;
};
