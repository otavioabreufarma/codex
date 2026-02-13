"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePluginToken = requirePluginToken;
exports.requireBotApiKey = requireBotApiKey;
exports.isInfinitePayWebhookValid = isInfinitePayWebhookValid;
const env_1 = require("../config/env");
function requirePluginToken(req, res, next) {
    const token = req.header("x-api-token");
    if (!token || token !== env_1.env.pluginApiToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    next();
}
function requireBotApiKey(req, res, next) {
    const token = req.header("x-api-key");
    if (!token || token !== env_1.env.botApiKey) {
        res.status(401).json({ error: "Unauthorized bot" });
        return;
    }
    next();
}
function isInfinitePayWebhookValid(req) {
    const signature = req.header("x-infinitepay-signature") || req.header("x-webhook-secret");
    return Boolean(signature && signature === env_1.env.infinitepayWebhookSecret);
}
