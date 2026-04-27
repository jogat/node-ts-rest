import { CorsOptions } from "cors";

const origin = process.env.CORS_OPTION_ORIGIN;

export const corsConfig: CorsOptions = origin
  ? {
      origin: origin.split(",").map((value) => value.trim()),
    }
  : {};
