const { Events, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fetch = require("sync-fetch");
const scanner = require("../scanner.js");
const nexus = require("../nexus.js");

function createEmbed(log, net6) {
	const mods = scanner.parseMods(log, net6);
	//console.log("mods: "+mods);
	const nexusMods = nexus.nexusList(mods);
	const errormods = scanner.parseErrors(log);

	const exampleEmbed = {
		color: 0x00ff00,
		title: "Log Results: ",
		description:
			"*DM @GrahamKracker#6379 with your log if there are any false detections, as this bot is still in alpha.*",
		thumbnail: {
			url: "https://images-ext-2.discordapp.net/external/r2THoHnoRQQN2p6N9vnpTK29tMIbt0bPMHBG4Mkd3kE/https/i.imgur.com/BSXtkvW.png?width=1049&height=617",
		},
		fields: [],
		timestamp: new Date().toISOString(),
		footer: { text: "Created by GrahamKracker#6379 and Timotheeee1#1337" },
	};
	if (nexusMods.length > 0) {
		exampleEmbed.fields.push({
			name: "Nexus Mods: ", //__
			value:
				"\n- " +
				nexusMods.join("\n- ") +
				"\n***Do not get mods from Nexus. Most of the mods there are outdated/broken/stolen. Remove those mods and try again. ***",
		});
	}
	if (errormods.length > 0) {
		exampleEmbed.fields.push({
			name: "Mods With Errors: ",
			value:
				"\n- " +
				errormods.join("\n- ") +
				"\n***Make sure you are using the newest version. Usually you can find the newest version on the mod browser or in one of the modding servers. After you have downloaded the newest version, if it still errors, remove it.***",
		});
	}
	const miscErrors = scanner.parseMisc(log, net6);
	if (miscErrors != "") {
		exampleEmbed.fields.push({
			name: "Misc Errors: ",
			value: miscErrors,
		});
	}
	const suggestions = scanner.parseSuggestions(log, net6);
	if (suggestions != "") {
		exampleEmbed.fields.push({
			name: "Suggestions: ",
			value: suggestions,
		});
	}
	//colors
	if (nexusMods.length > 0 || errormods.length > 0 || miscErrors != "") {
		exampleEmbed.color = 0xff0000;
	} else if (suggestions != "") {
		exampleEmbed.color = 0xffff00;
	}
	return exampleEmbed;
}

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		const attachment = message.attachments.first();
		if (!attachment) return;
		const file = attachment?.url;

		let response;

		// fetch the file from the external URL
		response = fetch(file);

		// take the response stream and read it to completion
		const text = await response.text();

		if (text && scanner.isLog(text)) {
			const result = createEmbed(text, scanner.isNet6(text));
			let date = new Date(Date.now()).toLocaleString();
			if (result.fields.length > 0) {
				//message.reply({ content: result });
				message.reply({
					embeds: [result],
				});

				console.log(
					`Returned Scanned Results at ${date} in channel: ${message.channel.name} in server: ${message.guild.name} from ${message.author.username}#${message.author.discriminator}`
				);
			} else {
				message.reply({
					content: "No issues found in log",
				});
				console.log(
					`Detected log sent at ${date} in channel: ${message.channel.name} in server: ${message.guild.name} from ${message.author.username}#${message.author.discriminator}`
				);
			}
		}
	},
};
