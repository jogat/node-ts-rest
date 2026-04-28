import cors from "cors";
import express, { Express, Request, Response } from "express";
import apiRouter from "@routes/api";
import { config } from "@config/index";
import { errorHandler, notFound } from "@http/middleware";

export class Server {
  app: Express;
  port: string;

  constructor() {
    this.app = express();
    this.port = config.app.port;

    this.middlewares();
    this.routes();
    this.exceptionHandling();
  }

  routes() {
    this.app.use(apiRouter);

    this.app.get("/", (req: Request, res: Response) => {
      res.send("Express + TypeScript Server");
    });
  }

  middlewares() {
    this.app.use(cors(config.cors));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  exceptionHandling() {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  getExpressApp(): Express {
    return this.app;
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`[server]: Server is running at http://localhost:${this.port}`);
    });
  }
}
