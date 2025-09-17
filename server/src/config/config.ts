import dotenv from "dotenv";
import path from "node:path";
import { configSchema } from "./schema";
import { LogLevel } from "../types";

export class Config {
  public port: number;
  public logLevel: LogLevel;

  constructor() {
    dotenv.config({
      path: path.resolve(process.cwd(), ".env"),
      override: true,
    });

    const env = this.parse();
    this.port = parseInt(env.PORT || "3000", 10);
    this.logLevel = env.LOG_LEVEL;
  }

  private parse() {
    const result = configSchema.safeParse(process.env);
    if (result.error) {
      console.error(
        "Error occured while parsing environment variables",
        result.error
      );
      process.exit(1);
    }

    return result.data;
  }
}
