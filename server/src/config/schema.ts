import { z } from "zod";

export const configSchema = z.object({
  PORT: z.string(),
  LOG_LEVEL: z
    .enum(["info", "warn", "error", "debug", "trace"])
    .default("trace"),
});
