"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireServerToken = requireServerToken;
exports.requireBotToken = requireBotToken;
exports.verifyInfinitePaySignature = verifyInfinitePaySignature;
const env_1 = require("../config/env");
function requireServerToken(req, res, next) {
    const token = req.header("x-api-token");
    const serverId = req.params.serverId || req.body.serverId || req.query.serverId;
    if (!token || !serverId || !(serverId in env_1.env.serverTokens)) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const expected = env_1.env.serverTokens[serverId];
    if (token !== expected) {
        res.status(401).json({ error: "Invalid token" });
        return;
    }
    next();
}
function requireBotToken(req, res, next) {
    if (req.header("x-bot-token") !== env_1.env.botWebhookToken) {
        res.status(401).json({ error: "Unauthorized bot" });
        return;
    }
    next();
}
function verifyInfinitePaySignature(req, res, next) {
    const signature = req.header("x-infinitepay-signature") || req.header("x-webhook-secret");
    if (!signature || signature !== env_1.env.infinitepayWebhookSecret) {
        res.status(401).json({ error: "Invalid webhook signature" });
        return;
    }
    next();
}
