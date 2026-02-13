import dotenv from "dotenv";

dotenv.config();

const required = [
  "DISCORD_TOKEN",
  "CLIENT_ID",
  "GUILD_ID",
  "VIP_ROLE_ID",
  "VIP_PLUS_ROLE_ID",
  "BACKEND_URL",
  "BOT_WEBHOOK_TOKEN"
] as const;

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
}

export const env = {
  discordToken: process.env.DISCORD_TOKEN as string,
  clientId: process.env.CLIENT_ID as string,
  guildId: process.env.GUILD_ID as string,
  vipRoleId: process.env.VIP_ROLE_ID as string,
  vipPlusRoleId: process.env.VIP_PLUS_ROLE_ID as string,
  backendUrl: process.env.BACKEND_URL as string,
  botWebhookToken: process.env.BOT_WEBHOOK_TOKEN as string,
  port: Number(process.env.PORT || 3001)
};
