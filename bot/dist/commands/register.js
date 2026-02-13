"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
const discord_js_1 = require("discord.js");
const env_1 = require("../config/env");
async function registerCommands() {
    const command = new discord_js_1.SlashCommandBuilder()
        .setName("vip")
        .setDescription("Abrir painel de vinculação Steam e compra VIP");
    const rest = new discord_js_1.REST({ version: "10" }).setToken(env_1.env.discordToken);
    await rest.put(discord_js_1.Routes.applicationGuildCommands(env_1.env.clientId, env_1.env.guildId), {
        body: [command.toJSON()]
    });
}
