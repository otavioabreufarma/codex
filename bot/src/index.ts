import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { env } from "./config/env";
import { registerCommands } from "./commands/register";
import { sendVipPanel } from "./interactions/panel";
import {
  ackBotEvent,
  fetchBotEvents,
  getSteamLinkStatus,
  requestCheckout,
  requestSteamLink
} from "./services/backendClient";
import { getUserServer, setUserServer } from "./services/sessionStore";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

async function processPendingEvents(): Promise<void> {
  const events = await fetchBotEvents();
  if (events.length === 0) return;

  const guild = await client.guilds.fetch(env.guildId);

  for (const event of events) {
    try {
      const member = (await guild.members.fetch(event.discordId)) as GuildMember;

      if (event.type === "PAYMENT_CONFIRMED") {
        const roleId = event.vipType === "vip+" ? env.vipPlusRoleId : env.vipRoleId;
        await member.roles.add(roleId);
        await member.send(`Pagamento confirmado. VIP ${event.vipType?.toUpperCase()} ativado com sucesso.`);
      }

      if (event.type === "VIP_EXPIRED") {
        await member.roles.remove(env.vipRoleId).catch(() => null);
        await member.roles.remove(env.vipPlusRoleId).catch(() => null);
        await member.send("Seu VIP expirou e os cargos foram removidos.");
      }

      await ackBotEvent(event.eventId);
    } catch (error) {
      console.error(`[bot] failed to process event ${event.eventId}`, error);
    }
  }
}

async function awaitSteamSync(discordId: string, serverId: "server1" | "server2"): Promise<boolean> {
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i += 1) {
    const linked = await getSteamLinkStatus(discordId, serverId);
    if (linked) return true;
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
  return false;
}

client.once(Events.ClientReady, async (readyClient) => {
  await registerCommands();
  setInterval(() => {
    processPendingEvents().catch((error) => console.error("[bot] polling error", error));
  }, env.pollingIntervalMs);
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

client.login(env.discordToken);
