try {
  require.resolve('./config.json');
    var { clientId, token } = require('./config.json');
} catch(e) {
    var token = process.env.TOKEN;  
    var clientId = process.env.CLIENTID;
}
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(token);

// ...

// for global commands
rest.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
// ...

