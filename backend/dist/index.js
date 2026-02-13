"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const expirationJob_1 = require("./jobs/expirationJob");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: "1mb" }));
app.use(routes_1.default);
app.listen(env_1.env.port, () => {
    console.log(`[backend] listening on port ${env_1.env.port}`);
    (0, expirationJob_1.startExpirationJob)();
});
