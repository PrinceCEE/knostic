import fs from "node:fs";
import csv from "csv-parser";
import fastcsv from "fast-csv";

const parseCSV = <T>(filepath: string) => {};

const generateCSV = (data: any, headers: any) => {
  return new Promise((resolve, reject) => {
    fastcsv
      .writeToString(data, { headers })
      .then((csvstring) => {
        resolve(csvstring);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const csvProvider = { parseCSV, generateCSV };
