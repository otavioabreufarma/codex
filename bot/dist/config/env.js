"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const required = [
    "DISCORD_TOKEN",
    "CLIENT_ID",
    "GUILD_ID",
    "VIP_ROLE_ID",
    "VIP_PLUS_ROLE_ID",
    "BACKEND_URL",
    "BOT_API_KEY",
    "POLLING_INTERVAL_MS"
];
for (const key of required) {
    if (!process.env[key])
        throw new Error(`Missing env var: ${key}`);
}
exports.env = {
    discordToken: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    vipRoleId: process.env.VIP_ROLE_ID,
    vipPlusRoleId: process.env.VIP_PLUS_ROLE_ID,
    backendUrl: process.env.BACKEND_URL,
    botApiKey: process.env.BOT_API_KEY,
    pollingIntervalMs: Number(process.env.POLLING_INTERVAL_MS)
};
