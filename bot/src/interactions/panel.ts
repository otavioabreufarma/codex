import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder
} from "discord.js";

export async function sendVipPanel(interaction: ChatInputCommandInteraction): Promise<void> {
  const select = new StringSelectMenuBuilder()
    .setCustomId("server_select")
    .setPlaceholder("Escolha o servidor Rust")
    .addOptions(
      { label: "Servidor 1", value: "server1" },
      { label: "Servidor 2", value: "server2" }
    );

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("link_steam").setLabel("Vincular Steam").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("buy_vip").setLabel("Comprar VIP").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("buy_vip_plus").setLabel("Comprar VIP+").setStyle(ButtonStyle.Success)
  );

  await interaction.reply({
    content: "Painel VIP aberto. Selecione o servidor e use os botões.",
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select), buttons],
    ephemeral: true
  });
}
