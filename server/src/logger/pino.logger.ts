import pino from "pino";
import { ILogger } from "./logger.interface";
import { config } from "../config";

export class PinoLogger implements ILogger {
  private pinoLogger: pino.Logger;

  constructor() {
    this.pinoLogger = pino({
      level: config.logLevel,
      serializers: {
        err: pino.stdSerializers.err,
      },
    });
  }

  info(message: string, meta?: any): void {
    this.pinoLogger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.pinoLogger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.pinoLogger.error(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.pinoLogger.debug(message, meta);
  }

  trace(message: string, meta?: any): void {
    this.pinoLogger.trace(message, meta);
  }
}
