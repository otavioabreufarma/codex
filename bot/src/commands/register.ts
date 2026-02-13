import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { env } from "../config/env";

export async function registerCommands(): Promise<void> {
  const command = new SlashCommandBuilder()
    .setName("vip")
    .setDescription("Abrir painel de vinculação Steam e compra VIP");

  const rest = new REST({ version: "10" }).setToken(env.discordToken);
  await rest.put(Routes.applicationGuildCommands(env.clientId, env.guildId), {
    body: [command.toJSON()]
  });
}
