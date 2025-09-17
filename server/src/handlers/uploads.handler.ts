import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs/promises";

import {
  ClassificationsData,
  IResponse,
  StringsData,
  UploadFiles,
  UploadResponse,
} from "@/types";
import { BadRequestException, NotFoundException } from "@/errors";
import { Logger } from "@/logger";
import { CSVService } from "@/services";

export class UploadsHandler {
  constructor(
    private readonly logger: Logger,
    private readonly csvService: CSVService
  ) {}

  handleUpload = async (
    req: Request,
    res: Response
  ): Promise<UploadResponse> => {
    this.logger.info("Upload csv files");

    try {
      const files = req.files! as unknown as UploadFiles;

      if (!files || !(files.stringsFile || files.classificationsFile)) {
        throw new BadRequestException(
          "At least one of strings and classifications files required"
        );
      }

      let stringsData: StringsData[] = [];
      let classificationsData: ClassificationsData[] = [];

      if (files.stringsFile) {
        const { results, headers } = await this.csvService.parse<StringsData>(
          files.stringsFile[0].path
        );

        if (!this.csvService.isStringsData(headers)) {
          throw new BadRequestException("Invalid strings data");
        }

        // normalise and rewrite the content of the file
        const normalisedData = this.csvService.normalise(results);
        await this.csvService.generateCSV(
          normalisedData,
          headers,
          files.stringsFile[0].path
        );

        // rename the name to stay consistent
        await fs.rename(
          files.stringsFile[0].path,
          path.join(__dirname, "../uploads", "strings.csv")
        );

        stringsData = normalisedData;
      }

      if (files.classificationsFile) {
        const { results, headers } =
          await this.csvService.parse<ClassificationsData>(
            files.classificationsFile[0].path
          );

        if (!this.csvService.isClassificationsData(headers)) {
          throw new BadRequestException("Invalid classifications data");
        }

        // normalise and rewrite the content of the file
        const normalisedData = this.csvService.normalise(results);
        await this.csvService.generateCSV(
          normalisedData,
          headers,
          files.classificationsFile[0].path
        );

        // rename the name to stay consistent
        await fs.rename(
          files.classificationsFile[0].path,
          path.join(__dirname, "../uploads", "classifications.csv")
        );

        classificationsData = normalisedData;
      }

      return {
        success: true,
        message: "OK",
        data: {
          stringsData,
          classificationsData,
        },
      };
    } catch (err) {
      this.logger.error("Error occured while handling csv upload", err);
      throw err;
    }
  };

  getFileNames = async (
    req: Request,
    res: Response
  ): Promise<IResponse<string[]>> => {
    this.logger.info("Get file names");

    return {
      success: true,
      message: "OK",
      data: await this.csvService.getFiles(),
    };
  };

  getFile = async (
    req: Request,
    res: Response
  ): Promise<IResponse<(StringsData | ClassificationsData)[]>> => {
    this.logger.info("Get file");

    try {
      const fileName = req.params.filename;
      const files = await this.csvService.getFiles();
      if (!files.includes(fileName)) {
        throw new NotFoundException("File not found");
      }

      const { results } = await this.csvService.parse<
        StringsData | ClassificationsData
      >(path.join(__dirname, "../uploads", fileName));

      return {
        success: true,
        message: "OK",
        data: results,
      };
    } catch (err) {
      this.logger.error("Error occured while fetching file", err);
      throw err;
    }
  };

  updateFile = async (req: Request, res: Response) => {
    this.logger.info(`Edit file - ${req.params.filename}`);

    try {
      const fileName = req.params.filename;

      const files = await this.csvService.getFiles();
      if (!files.includes(fileName)) {
        throw new NotFoundException("File not found");
      }

      const newData: (StringsData | ClassificationsData)[] = req.body.updates;
      const { headers } = await this.csvService.parse<
        StringsData | ClassificationsData
      >(path.join(__dirname, "../uploads", fileName));

      if (this.csvService.isStringsData(headers)) {
        const { results } = await this.csvService.parse<ClassificationsData>(
          path.join(__dirname, "../uploads", "classifications.csv")
        );

        const { isValid, errors } = this.csvService.validateStringsData(
          newData as StringsData[],
          results
        );
        if (!isValid) {
          const response: IResponse = {
            success: false,
            message: "Error",
            data: errors,
          };
          res.status(401).json(response);
          return;
        }

        await this.csvService.generateCSV(
          newData,
          headers,
          path.join(__dirname, "../uploads", "strings.csv")
        );
      } else {
        const { isValid, errors } = this.csvService.validateClassificationsData(
          newData as ClassificationsData[]
        );
        if (!isValid) {
          const response: IResponse = {
            success: false,
            message: "Error",
            data: errors,
          };
          res.status(401).json(response);
          return;
        }

        await this.csvService.generateCSV(
          newData,
          headers,
          path.join(__dirname, "../uploads", "classifications.csv")
        );
      }

      // send the response directly, without passing the control to the asyncifier
      const response: IResponse = {
        success: true,
        message: "OK",
      };
      res.status(200).json(response);
    } catch (err) {
      this.logger.info("Error occured while updating a file", err);
      throw err;
    }
  };

  downloadFile = async (req: Request, res: Response) => {
    this.logger.info(`Download file - ${req.params.filename}`);
    try {
      const fileName = req.params.filename;
      const files = await this.csvService.getFiles();
      if (!files.includes(fileName)) {
        throw new NotFoundException("File not found");
      }
      const filePath = path.join(__dirname, "../uploads", fileName);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.sendFile(filePath);
    } catch (err) {
      this.logger.info("Error occured while downloading a file", err);
      throw err;
    }
  };
}
