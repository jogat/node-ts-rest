import "dotenv/config";

import { appConfig } from "@config/app";
import { corsConfig } from "@config/cors";

export const config = {
  app: appConfig,
  cors: corsConfig,
};
