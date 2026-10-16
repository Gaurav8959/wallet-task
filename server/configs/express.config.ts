import cors from "cors";
import express from "express";
import morgan from "morgan";
import constants from "../constants";
import {
  errorHandler,
  notFoundErrorHandler,
} from "../middlewares/api-error-handler.middleware";
import authenticate from "../middlewares/authenticate.middleware";
import joiErrorHandler from "../middlewares/joi-error-handler.middleware";
import indexRoute from "../routes/index.route";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(authenticate);

app.use(constants.APPLICATION.url.basePath, indexRoute);

app.use(joiErrorHandler);
app.use(notFoundErrorHandler);
app.use(errorHandler);

export default app;
