import pino from "pino";
import pinoHttp from "pino-http";
import { config } from "../config/env";

const logger = pino({
  level: config.nodeEnv === "production" ? "info" : "debug",
  transport:
    config.nodeEnv !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export const httpLogger = pinoHttp({
  logger,
  // Trim what gets attached to req/res in every log line
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  // Optional: skip noisy per-request start logs, keep only the completed one
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} -> ${res.statusCode}`;
  },
  customReceivedMessage: () => "", // set to undefined/remove if you don't want a "request received" line
});

export default logger;
