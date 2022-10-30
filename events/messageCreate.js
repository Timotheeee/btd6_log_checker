const { Events } = require("discord.js");
const fetch = require("sync-fetch");
const scanner = require("../scanner.js");

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
			const result = scanner.scanLog(text, scanner.isNet6(text));	
			let date = new Date(Date.now()).toLocaleString();
			if (result != "") {
				message.reply({ content: result });
				
				console.log(`Returned Scanned Results at ${date}`);
				//message.reply({embeds: result});
			}
			else{
				console.log(`Detected log sent at ${date}`);
			}
		}
	},
};
