const { Events, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fetch = require("sync-fetch");
const scanner = require("../scanner.js");
const nexus = require("../nexus.js");

function createEmbed(log, islatestlog) {
	const mods = scanner.parseMods(log);
	const versionMods = scanner.parseModInfoString(log);
	const nexusMods = nexus.nexusList(mods);
	const errormods = scanner.parseErrors(log);

	const messageResults = {
		color: 0x00ff00,
		title: "Log Results: ",
		description:
			"Contact GrahamKracker#6379, if there are any false detections.",
		thumbnail: {
			url: "https://images-ext-2.discordapp.net/external/r2THoHnoRQQN2p6N9vnpTK29tMIbt0bPMHBG4Mkd3kE/https/i.imgur.com/BSXtkvW.png?width=1049&height=617",
		},
		fields: [],
		timestamp: new Date().toISOString(),
		footer: { text: "Created by GrahamKracker#6379 and Timotheeee1#1337 | "+mods.length+" mods detected" },
	};
	/*if (nexusMods.length > 0) {
		messageResults.fields.push({
			name: "Nexus Mods: ", //__
			value:
				"\n- " +
				nexusMods.join("\n- ") +
				"\n***Do not get mods from Nexus. Most of the mods there are outdated/broken/stolen. Remove those mods and try again. ***",
		});
	}*/
	let Errors = scanner.parseMisc(log);
	if (!islatestlog) {
		Errors +="- Make sure you are sending the latest log, it can be found within the MelonLoader folder, which is in the BTD6 folder, as a file named `Latest.log`. You can find out more information by typing `!log`.\n";
	}
		if (Errors != "") {
		messageResults.fields.push({
			name: "Errors: ",
			value: Errors,
		});
	}

	if (errormods.length > 0 && !Errors.includes("- ***You need MelonLoader v0.6.0, you need to install following the guide [here](https://hemisemidemipresent.github.io/btd6-modding-tutorial/). (Make sure to delete the existing Melonloader files first)***\n")) {
		messageResults.fields.push({
			name: "Mods With Errors: ",
			value:
				"\n- " +
				errormods.join("\n- ") +
				"\n***Make sure you are using the newest version. Usually you can find the newest version on the mod browser or in one of the modding servers. After you have downloaded the newest version, if it still errors, remove it.***",
		});
	}
	

	const suggestions = scanner.parseSuggestions(log);
	if (suggestions != "") {
		messageResults.fields.push({
			name: "Suggestions: ",
			value: suggestions,
		});
	}
	if (/*nexusMods.length > 0 ||*/ errormods.length > 0 || Errors != "") {
		messageResults.color = 0xff0000;
		messageResults.description += "\n***Major issues found, please fix them.***"
	} else if (suggestions != "") {
		messageResults.color = 0xffff00;
		messageResults.description += "\n**No major issues found, but there are some suggestions.**"
	}
	else
	{
		messageResults.description += "\n*No issues found.*"
	}

	if (versionMods.length > 0)
	{
		messageResults.fields.push({
		name: "Mods: ",
		value:
			"- " +
			versionMods.join("\n- "),
	});
	}
	return messageResults;
}

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;
		const attachment = message.attachments.first();
		if (!attachment) return;
		const file = attachment?.url;

		// fetch the file from the external URL
		let response = fetch(file);

		// take the response stream and read it to completion
		const text = await response.text();

		if (text && scanner.isLog(text)) {
			const result = createEmbed(
				text,
				attachment.name == "Latest.log"
			);
			let date = new Date(Date.now()).toLocaleString();
			if (result.fields.length > 0) {
				message.reply({
					embeds: [result],
				});
				console.log(
					`Returned issues for log: ${attachment.name}, sent at ${date} in channel: #${message.channel.name} in server: ${message.guild.name} from ${message.author.username}#${message.author.discriminator}`
				);
			} else {
				message.reply({
					content:
						"No issues found in log, contact GrahamKracker#6379 if you think this is a mistake.",
				});
				console.log(
					`No issues for log: ${attachment.name}, sent at ${date} in channel: #${message.channel.name} in server: ${message.guild.name} from ${message.author.username}#${message.author.discriminator}`
				);
			}
		}
	},
};
