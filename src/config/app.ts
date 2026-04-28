export const appConfig = {
  port: process.env.PORT || "3000",
  environment: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
};
