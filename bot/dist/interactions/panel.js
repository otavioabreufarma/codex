"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVipPanel = sendVipPanel;
const discord_js_1 = require("discord.js");
async function sendVipPanel(interaction) {
    const select = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId("server_select")
        .setPlaceholder("Escolha o servidor Rust")
        .addOptions({ label: "Servidor 1", value: "server1" }, { label: "Servidor 2", value: "server2" });
    const buttons = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId("link_steam").setLabel("Vincular Steam").setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId("buy_vip").setLabel("Comprar VIP").setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId("buy_vip_plus").setLabel("Comprar VIP+").setStyle(discord_js_1.ButtonStyle.Success));
    await interaction.reply({
        content: "Painel VIP aberto. Selecione o servidor e use os botões.",
        components: [new discord_js_1.ActionRowBuilder().addComponents(select), buttons],
        ephemeral: true
    });
}
