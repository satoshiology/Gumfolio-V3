import serverless from "serverless-http";
import { app, setupApp } from "../../expressApp.js";

setupApp();

export const handler = serverless(app);

export const config = {
  path: ["/api/*", "/auth/callback", "/auth/callback/"]
};
