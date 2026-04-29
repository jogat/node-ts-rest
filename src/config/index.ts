import "dotenv/config";

import { appConfig } from "@config/app";
import { corsConfig } from "@config/cors";
import { databaseConfig } from "@config/database";
import { mailConfig } from "@config/mail";
import { queueConfig } from "@config/queue";
import { storageConfig } from "@config/storage";

export const config = {
  app: appConfig,
  cors: corsConfig,
  database: databaseConfig,
  mail: mailConfig,
  queue: queueConfig,
  storage: storageConfig,
};
