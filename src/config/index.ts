import "dotenv/config";

import { appConfig } from "@config/app";
import { corsConfig } from "@config/cors";
import { databaseConfig } from "@config/database";

export const config = {
  app: appConfig,
  cors: corsConfig,
  database: databaseConfig,
};
