const { Client, Interaction, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Displays the latency of the bot's and Discord's API!"),
  async execute(interaction) {
    console.log("Ponging!");
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true
    });

    const now = sent.createdTimestamp;
    const sum = interaction.client.ws.shards.reduce((a, b) => a + b.ping, 0);
    const ping = sum / interaction.client.ws.shards.size; 
    interaction.deleteReply();

    await interaction.followUp({
      content: `My Latency is ${
        now - interaction.createdTimestamp
      }ms! \nDiscord's API Latency is ${ping}ms!`,
      ephemeral: true,
    });
  },
};
