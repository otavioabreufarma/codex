import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import router from "./routes";
import { startExpirationJob } from "./jobs/expirationJob";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(router);

app.listen(env.port, () => {
  console.log(`[backend] listening on port ${env.port}`);
  startExpirationJob();
});
