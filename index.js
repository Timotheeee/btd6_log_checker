const fs = require("fs");
const path = require("node:path");

const { Client, Collection, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

try {
  require.resolve("./config.json");
  var { token } = require("./config.json");
  var { nexusKey } = require("./config.json");
} catch (e) {
  var token = process.env.TOKEN;
  var nexusKey = process.env.NEXUSKEY;
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
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}


const nexus = require("./nexus.js");
const scanner = require("./scanner.js");


nexus.cacheNexusFiles();

//let log = fs.readFileSync("./nexus_cache/latest.log", "utf-8");

//console.log(scanner.parseMods(log));

//console.log(nexus.nexusList(scanner.parseMods(log)));

nexus.createWhitelist().then((whitelist) => {
  console.log("Successfully created whitelist!");
    client.login(token);
});
