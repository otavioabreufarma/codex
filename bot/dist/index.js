"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const env_1 = require("./config/env");
const register_1 = require("./commands/register");
const panel_1 = require("./interactions/panel");
const backendClient_1 = require("./services/backendClient");
const sessionStore_1 = require("./services/sessionStore");
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMembers]
});
async function processPendingEvents() {
    const events = await (0, backendClient_1.fetchBotEvents)();
    if (events.length === 0)
        return;
    const guild = await client.guilds.fetch(env_1.env.guildId);
    for (const event of events) {
        try {
            const member = (await guild.members.fetch(event.discordId));
            if (event.type === "PAYMENT_CONFIRMED") {
                const roleId = event.vipType === "vip+" ? env_1.env.vipPlusRoleId : env_1.env.vipRoleId;
                await member.roles.add(roleId);
                await member.send(`Pagamento confirmado. VIP ${event.vipType?.toUpperCase()} ativado com sucesso.`);
            }
            if (event.type === "VIP_EXPIRED") {
                await member.roles.remove(env_1.env.vipRoleId).catch(() => null);
                await member.roles.remove(env_1.env.vipPlusRoleId).catch(() => null);
                await member.send("Seu VIP expirou e os cargos foram removidos.");
            }
            await (0, backendClient_1.ackBotEvent)(event.eventId);
        }
        catch (error) {
            console.error(`[bot] failed to process event ${event.eventId}`, error);
        }
    }
}
async function awaitSteamSync(discordId, serverId) {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i += 1) {
        const linked = await (0, backendClient_1.getSteamLinkStatus)(discordId, serverId);
        if (linked)
            return true;
        await new Promise((resolve) => setTimeout(resolve, 15000));
    }
    return false;
}
client.once(discord_js_1.Events.ClientReady, async (readyClient) => {
    await (0, register_1.registerCommands)();
    setInterval(() => {
        processPendingEvents().catch((error) => console.error("[bot] polling error", error));
    }, env_1.env.pollingIntervalMs);
    console.log(`[bot] online as ${readyClient.user.tag}`);
});
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === "vip") {
        await (0, panel_1.sendVipPanel)(interaction);
        return;
    }
    if (interaction.isStringSelectMenu() && interaction.customId === "server_select") {
        const selected = interaction.values[0];
        (0, sessionStore_1.setUserServer)(interaction.user.id, selected);
        await interaction.reply({ content: `Servidor selecionado: ${selected}`, ephemeral: true });
        return;
    }
    if (interaction.isButton()) {
        const serverId = (0, sessionStore_1.getUserServer)(interaction.user.id);
        try {
            if (interaction.customId === "link_steam") {
                const authUrl = await (0, backendClient_1.requestSteamLink)(interaction.user.id, serverId);
                await interaction.reply({ content: `Abra para vincular Steam: ${authUrl}`, ephemeral: true });
                await interaction.user.send(`Vincule sua Steam (${serverId}): ${authUrl}`);
                awaitSteamSync(interaction.user.id, serverId)
                    .then(async (linked) => {
                    if (linked) {
                        await interaction.user.send("Sua conta Steam foi vinculada com sucesso e sincronizada.");
                    }
                })
                    .catch(() => null);
                return;
            }
            if (interaction.customId === "buy_vip" || interaction.customId === "buy_vip_plus") {
                const type = interaction.customId === "buy_vip" ? "vip" : "vip+";
                const checkout = await (0, backendClient_1.requestCheckout)(interaction.user.id, serverId, type);
                await interaction.reply({
                    content: `Pagamento criado (${type.toUpperCase()}).\nPedido: ${checkout.orderNsu}\nLink: ${checkout.checkoutUrl}`,
                    ephemeral: true
                });
                await interaction.user.send(`Finalize o pagamento ${type.toUpperCase()}: ${checkout.checkoutUrl}`);
                return;
            }
        }
        catch (error) {
            await interaction.reply({
                content: `Erro: ${error.message}`,
                ephemeral: true
            });
        }
    }
});
client.login(env_1.env.discordToken);
