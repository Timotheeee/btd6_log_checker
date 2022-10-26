/*const { SlashCommandBuilder } = require('discord.js');

try {
    require.resolve('../config.json');
    var { inviteLink } = require('../config.json');
} catch(e) {
    var inviteLink = process.env.INVITELINK;  
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Replies with the link to the bot!'),
    async execute(interaction) {
        console.log("Sending Invite Link!");
        await interaction.reply({content:inviteLink, ephemeral: true});
    },
};
*/
