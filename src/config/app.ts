export const appConfig = {
  port: process.env.PORT || "3000",
  prefix: process.env.PREFIX || "/ws",
  environment: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
};
