const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const https = require('https');
var request = require('request');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);

client.on('messageCreate', async message => {
    // console.log(message);
    // console.log(message.content);
    if (message.author.bot) return;
    const attachment = message.attachments.first();
    if(attachment){
        const { url } = attachment;
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(body);
                var resp = "";
                if(body.includes("Bloons Mod Manager")){resp+="Do not use the mod manager. Read this: https://hemisemidemipresent.github.io/btd6-modding-tutorial\n";}

                if(body.includes("BloonsTD6 Mod Helper v2.3.1")){resp+="You got the mod helper from the nexus. That version is completely outdated, get the new one here: https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll\n";}
                if(body.includes("get_display")){resp+="A lot of custom tower mods broke in a recent BTD6 update. Remove the ones that are giving errors.\n";}
                if(body.includes("Could not load file or assembly 'System.Runtime, Version=6.0.0.0")){resp+="Baydock's mods require the .net6 version of Melonloader\n";}
                if((body.includes("BloonsTD6 Mod Helper.dll") || body.includes("BloonsTD6_Mod_Helper.dll") || body.includes("BloonsTD6 Mod Helper v3.0.0")) && !body.includes("v2.3.1") && !body.includes("BloonsTD6 Mod Helper v3.0.2")){resp+="Your mod helper is outdated. Get the new version here: https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll\n";}
                if(body.includes("get_RegisteredMelons")){resp+="Reinstall melonloader using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe (Make sure to delete the existing Melonloader files first).\n";}
                if((body.includes("SHA256 Hash") || body.includes("Loading Melon Assembly")) && !body.includes("Helper") ){resp+="You need the mod helper. Download it here: https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll\n";}
                if(body.includes("2f50711868a5c57b35da38873a352652878ddd005e145baece1769ae79c0d6f8") || body.includes("0abc1e2aa3060c5794a14493655a4506e5d15bc8f569a192d251dd5902c68d28") || body.includes("Infinite Monkey") || body.includes("Elite Modding") || body.includes("kenx")){resp+="Do not get mods from Nexus. most of the mods there are outdated/broken/stolen. Remove those mods and try again.\n";}
                if(body.includes("MainMenu_OnEnable::Postfix()")){resp+="Gurren's old mods are broken\n";}
                if(body.includes("MelonLoader v0.5.4")){resp+="You need MelonLoader v0.5.5, you can get it using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe\n";}
                if(body.includes("NKHook6")){resp+="NKHook6 and all the mods that rely on it are broken\n";}
                if(body.includes("Gurren Core")){resp+="Gurren Core and all the mods that rely on it are broken\n";}
                if(body.includes("[BloonsTD6_Mod_Helper] Failed to register text")){resp+="A custom tower/paragon mod failed to load, it's probably broken/outdated.\n";}
                if(body.includes("inject the same type twice, or use a different namespace")){resp+="2 mods are conflicting with each other because they use the same namespace. (this is a common problem with datjanedoe's old mods)\n";}
                if(body.includes("Could not load file or assembly") && !body.includes("6.0.0.0") && !body.includes("PresentationFramework")){resp+="Your antivirus deleted a melonloader file. Reinstall melonloader and add an exception to your antivirus. Make sure to delete the existing Melonloader files first.\n";}
                if((body.includes("Could not resolve type with token") || body.includes("[ERROR] No Support Module Loaded!") || body.includes("NinjaKiwi.CT.API.dll") || body.includes("Critical failure when loading resources for mod BloonsTD6 Mod Helper")) && !body.includes("Monkeys for Hire") && !body.includes("2.3.1") && !body.includes("[Il2CppAssemblyGenerator] Moving NinjaKiwi.CT.API.dll")){resp+="Reinstall melonloader using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe (Make sure to delete the existing Melonloader files first).\n";}
                if(resp == "" && body.includes("System.MissingMethodException")){resp+="A mod is trying to use a function that no longer exists. Remove that mod and/or check for a new version\n";}
                if(body.includes(" (1).dll") || body.includes(" (2).dll") || body.includes(" (3).dll") ||body.includes(" (4).dll") ){resp+="Rename your mod files to remove the numbers at the end\n";}
                
                if(resp != "")
                    message.channel.send(resp);
            }
        }); 
    }
   
});


