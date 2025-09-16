import fs from "node:fs";
import csv from "csv-parser";
import * as fastcsv from "@fast-csv/format";
import path from "node:path";
import { ClassificationsData, RowValidationError, StringsData } from "@/types";

export class CSVService {
  private classificationsDataHeader = [
    "Topic",
    "SubTopic",
    "Industry",
    "Classification",
  ];

  parse = async <T>(filepath: string) => {
    const results: T[] = [];
    const headers: string[] = [];

    return new Promise<{ results: T[]; headers: string[] }>(
      (resolve, reject) => {
        fs.createReadStream(filepath)
          .pipe(csv())
          .on("headers", (headerList: string[]) => {
            headers.push(...headerList.map((h) => h.trim()));
          })
          .on("data", (data) => {
            results.push(data);
          })
          .on("end", () => {
            resolve({ results, headers });
          })
          .on("error", (error) => {
            reject(error);
          });
      }
    );
  };

  normalise = <T extends object>(rows: T[]) => {
    return rows.map((row) => {
      const newRow: Record<string, unknown> = {};
      Object.keys(row).forEach((key) => {
        const value = row[key as keyof T];
        newRow[String(key.trim())] = value;
      });
      return newRow as T;
    });
  };

  generateCSV = async (
    data: (StringsData | ClassificationsData)[],
    headers: string[],
    filepath: string
  ) => {
    fs.writeFileSync(filepath, await fastcsv.writeToString(data, { headers }), {
      encoding: "utf-8",
    });
  };

  getFiles = async () => {
    const uploadDir = path.join(__dirname, "../uploads");
    const files = await fs.promises.readdir(uploadDir);
    return files;
  };

  isStringsData = (headers: string[]) => {
    return headers.length === 9;
  };

  isClassificationsData = (headers: string[]) => {
    return headers.length === 4;
  };

  validateStringsData = (
    stringsData: StringsData[],
    classificationsData: ClassificationsData[]
  ) => {
    const errors: RowValidationError[] = [];
    const validCombinations = new Set<string>();

    // build valid combinations from classifications data
    classificationsData.forEach((row) => {
      const key = `${row.Topic}|${row.SubTopic}|${row.Industry}`;
      validCombinations.add(key);
    });

    // validate each row in strings data
    stringsData.forEach((row, index) => {
      const key = `${row.Topic}|${row.Subtopic}|${row.Industry}`;
      if (!validCombinations.has(key)) {
        errors.push({
          index,
          row,
          error: `Invalid combination: Topic "${row.Topic}", SubTopic "${row.Subtopic}", Industry "${row.Industry}" not found in classifications`,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  validateClassificationsData = (data: ClassificationsData[]) => {
    const errors: RowValidationError[] = [];

    data.forEach((row, index) => {
      this.classificationsDataHeader.forEach((field) => {
        const value = row[field as keyof ClassificationsData] as
          | string
          | undefined;
        if (!value || value.trim() === "") {
          errors.push({
            index,
            row,
            error: `${field} field is required`,
          });
        }
      });
    });
    return {
      isValid: errors.length === 0,
      errors,
    };
  };
}
