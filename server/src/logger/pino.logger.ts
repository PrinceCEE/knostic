import pino from "pino";
import { ILogger } from "./logger.interface";
import { Config } from "@/config";

export class PinoLogger implements ILogger {
  private pinoLogger: pino.Logger;

  constructor(private readonly config: Config) {
    this.pinoLogger = pino({
      level: this.config.logLevel,
      serializers: {
        err: pino.stdSerializers.err,
      },
    });
  }

  info(message: string, meta?: any): void {
    this.pinoLogger.info(meta, message);
  }

  warn(message: string, meta?: any): void {
    this.pinoLogger.warn(meta, message);
  }

  error(message: string, meta?: any): void {
    this.pinoLogger.error(meta, message);
  }

  debug(message: string, meta?: any): void {
    this.pinoLogger.debug(meta, message);
  }

  trace(message: string, meta?: any): void {
    this.pinoLogger.trace(meta, message);
  }
}
