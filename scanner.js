const nexus = require("./nexus.js");
function hasNumber(myString) {
  return /\(\d\)/.test(myString);
}
function scanLog(log, net6 = false) {
  let body = log;
  let resp = "";
  resp += "**Major Issues Found:**\n";
  const mods = parseMods(log, net6);
  //console.log(mods);

  const badmods = nexus.nexusList(mods);
  //console.log(badmods);

  if (badmods.length > 0) {
    resp +=
      "**Nexus mods detected: **\n- " +
      badmods.join("\n- ") +
      "\n**Do not get mods from Nexus. Most of the mods there are outdated/broken/stolen. Remove those mods and try again. \nDM @GrahamKracker#6379 with your log if there are any false detections, as this bot is still in alpha**\n\n";
  }
  if (body.includes("Bloons Mod Manager")) { resp +="- Do not use the mod manager. Read this: https://hemisemidemipresent.github.io/btd6-modding-tutorial\n"; }
  if (body.includes("BloonsTD6 Mod Helper v2.3.1")) { resp +="- You got the mod helper from the nexus. That version is completely outdated, get the new one here: https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll\n"; }
  if (body.includes("get_display")) { resp +="- A lot of custom tower mods broke in a recent BTD6 update. Remove the ones that are giving errors.\n"; }
  if (body.includes("Could not load file or assembly 'System.Runtime, Version=6.0.0.0")) { resp +="- Baydock's mods require the .net6 version of Melonloader\n"; }
  if ((body.includes("BloonsTD6 Mod Helper.dll") || body.includes("BloonsTD6_Mod_Helper.dll") || body.includes("BloonsTD6 Mod Helper v3.0.0")) && !body.includes("v2.3.1") && !body.includes("BloonsTD6 Mod Helper v3.0.2")) { resp +="- Your mod helper is outdated. Get the new version here: https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll\n"; }
  if (body.includes("get_RegisteredMelons")) { resp +="- Reinstall melonloader using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe (Make sure to delete the existing Melonloader files first).\n"; }
  if ((body.includes("SHA256 Hash") || body.includes("Loading Melon Assembly")) && !body.includes("Helper")) { resp +="- You need the mod helper. Download it here: https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll\n"; }
  if (body.includes("MainMenu_OnEnable::Postfix()")) { resp +="- Gurren's old mods are broken\n"; }
  if (body.includes("MelonLoader v0.5.4")) { resp +="- You need MelonLoader v0.5.5, you can get it using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe\n"; }
  if (body.includes("NKHook6")) { resp +="- NKHook6 and all the mods that rely on it are broken\n"; }
  if (body.includes("Gurren Core")) { resp +="- Gurren Core and all the mods that rely on it are broken\n"; }
  if (body.includes("[BloonsTD6_Mod_Helper] Failed to register text")) { resp +="- A custom tower/paragon mod failed to load, it's probably broken/outdated.\n"; }
  if (body.includes("inject the same type twice, or use a different namespace")) { resp +="- 2 mods are conflicting with each other because they use the same namespace. (this is a common problem with datjanedoe's old mods)\n"; }
  if (body.includes("Could not load file or assembly") && !body.includes("6.0.0.0") && !body.includes("PresentationFramework")) { resp +="- Your antivirus deleted a melonloader file. Reinstall melonloader and add an exception to your antivirus. Make sure to delete the existing Melonloader files first.\n"; }
  if ((body.includes("Could not resolve type with token") || body.includes("[ERROR] No Support Module Loaded!") || body.includes("NinjaKiwi.CT.API.dll") || body.includes("Critical failure when loading resources for mod BloonsTD6 Mod Helper")) && !body.includes("Monkeys for Hire") && !body.includes("2.3.1") && !body.includes("[Il2CppAssemblyGenerator] Moving NinjaKiwi.CT.API.dll")) { resp +="- Reinstall melonloader using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe (Make sure to delete the existing Melonloader files first).\n"; }
  if (resp == "" && body.includes("System.MissingMethodException")) { resp +="- A mod is trying to use a function that no longer exists. Remove that mod and/or check for a new version\n"; }
  
  
  if (resp == "**Major Issues Found:**\n") { resp = ""; }

  let respbackup = resp;
  let minorissues = 0;
  resp += "\n*Minor Issues Found:*\n";

  mods.forEach((l) => {

    if (hasNumber(l)) {

      resp += "- Remove the numbers at the end of the file: " + l + "\n";
      minorissues++;
    }
  });
  if (minorissues == 0) { resp = respbackup; }
  return resp;
}

function parseMods(log, net6) {
  let textByLine = log.split("\n");
  let regex;
  if (net6) {
  regex = /Melon Assembly loaded: \'\.\\Mods\\(.*?)\'/;
  } else {
    regex = /Loading Melon Assembly: \'\.\\Mods\\(.*?)\'/;
    console.log("net6 is false");
  }
  const mods = [];

  textByLine.forEach((l) => {
    try { mods.push(regex.exec(l)[1]); } catch { }
  });

  return mods;
}

function isLog(log) {
  if (
    log.includes("Game Name: BloonsTD6") &&
    log.includes("MelonLoader") &&
    log.includes("BloonsTD6") &&
    log.includes("Steam") &&
    log.includes("Game Developer: Ninja Kiwi")
  ) {
    return true;
  }
}
function isNet6(log) {
  if (log.includes("Runtime Type: net6")) {
    return true;
  }
}

module.exports = { scanLog, isLog, isNet6, parseMods };
