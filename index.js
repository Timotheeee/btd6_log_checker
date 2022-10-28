const fs = require("fs");
const path = require("node:path");
const keepAlive = require("./server.js");

const { Client, Collection, GatewayIntentBits } = require("discord.js");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	disableMentions: "everyone",
});

try {
	require.resolve("./config.json");
	var { token } = require("./config.json");
} catch (e) {
	var token = process.env.token;
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const nexus = require("./nexus.js");
const github = require("./github.js");

nexus.cacheNexusFiles();

//client.on('debug', console.log);

async function Start() {
	await keepAlive();
	await client.login(token).then(() => {
		console.log("client.login succeeded");
	});

	github.createWhitelist().then((whitelist) => {
		console.log("Successfully created whitelist!");
	});
  
}

Start();
