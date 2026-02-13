import express from "express";
import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { env } from "./config/env";
import { registerCommands } from "./commands/register";
import { sendVipPanel } from "./interactions/panel";
import { requestCheckout, requestSteamLink } from "./services/backendClient";
import { getUserServer, setUserServer } from "./services/sessionStore";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once(Events.ClientReady, async (readyClient) => {
  await registerCommands();
  console.log(`[bot] online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "vip") {
    await sendVipPanel(interaction);
    return;
  }

  if (interaction.isStringSelectMenu() && interaction.customId === "server_select") {
    const selected = interaction.values[0] as "server1" | "server2";
    setUserServer(interaction.user.id, selected);
    await interaction.reply({ content: `Servidor selecionado: ${selected}`, ephemeral: true });
    return;
  }

  if (interaction.isButton()) {
    const serverId = getUserServer(interaction.user.id);

    try {
      if (interaction.customId === "link_steam") {
        const authUrl = await requestSteamLink(interaction.user.id, serverId);
        await interaction.reply({ content: `Link Steam: ${authUrl}`, ephemeral: true });
        await interaction.user.send(`Vincule sua Steam (${serverId}): ${authUrl}`);
        return;
      }

      if (interaction.customId === "buy_vip" || interaction.customId === "buy_vip_plus") {
        const type = interaction.customId === "buy_vip" ? "vip" : "vip+";
        const checkout = await requestCheckout(interaction.user.id, serverId, type);
        await interaction.reply({
          content: `Pagamento criado (${type.toUpperCase()}).\nPedido: ${checkout.orderNsu}\nLink: ${checkout.checkoutUrl}`,
          ephemeral: true
        });
        await interaction.user.send(`Finalize o pagamento ${type.toUpperCase()}: ${checkout.checkoutUrl}`);
        return;
      }
    } catch (error) {
      await interaction.reply({
        content: `Erro: ${(error as Error).message}`,
        ephemeral: true
      });
    }
  }
});

const webhookApp = express();
webhookApp.use(express.json());

webhookApp.post("/internal/payment-status", async (req, res) => {
  if (req.header("x-bot-webhook-token") !== env.botWebhookToken) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const payload = req.body as {
    event: "payment_approved" | "vip_expired";
    discordId: string;
    vipType?: "vip" | "vip+";
  };

  try {
    const guild = await client.guilds.fetch(env.guildId);
    const member = (await guild.members.fetch(payload.discordId)) as GuildMember;

    if (payload.event === "payment_approved") {
      const roleId = payload.vipType === "vip+" ? env.vipPlusRoleId : env.vipRoleId;
      await member.roles.add(roleId);
      await member.send(`Pagamento aprovado! Seu VIP ${payload.vipType?.toUpperCase()} foi ativado.`);
    }

    if (payload.event === "vip_expired") {
      await member.roles.remove(env.vipRoleId).catch(() => null);
      await member.roles.remove(env.vipPlusRoleId).catch(() => null);
      await member.send("Seu VIP expirou e os cargos foram removidos.");
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

webhookApp.listen(env.port, () => console.log(`[bot] webhook listening on ${env.port}`));
client.login(env.discordToken);
