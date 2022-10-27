const nexus = require("./nexus.js");
function hasNumber(myString) {
    return /\(\d\)/.test(myString);
  }
function scanLog(log, net6 = false) {
  let body = log;
  let resp = "";
  resp+="**Major Issues Found:**\n";
  const mods = parseMods(log);
  //console.log(mods);

  const badmods = nexus.nexusList(mods);
  //console.log(badmods);

  if (badmods.length > 0) {
    resp +=
      "**Nexus mods detected: **\n- " +
      badmods.join("\n- ") +
      "\n**These mods are not allowed on this server because they are all either stolen, broken, or cheat mods. \nDM @GrahamKracker#6379 with your log if there are any false detections**\n";
  }
  else {resp = "";}
  if(body.includes("NKHook6")){resp+="NKHook6 and all the mods that rely on it are broken\n";}
  if(body.includes("Could not load file or assembly 'System.Runtime, Version=6.0.0.0")){resp+="Some mods require the alpha .net6 version of Melonloader, you can get it here: https://github.com/LavaGang/MelonLoader/actions?query=branch%3Acoreclr-reborn\n";}
  if(body.includes("Gurren Core")){resp+="Gurren Core and all the mods that rely on it are broken\n";}
  if(body.includes("BloonsTD6 Mod Helper v2.")){resp+="You need the new mod-helper, you can get it here: https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll\n";}
  if(body.includes("[BloonsTD6_Mod_Helper] Failed to register text")){resp+="A custom tower/paragon mod failed to load, it's probably broken/outdated.\n";}
  if(body.includes("MelonLoader v0.5.4")){resp+="You need MelonLoader v0.5.5, you can get it using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe\n";}
  if(body.includes("get_RegisteredMelons")){resp+="Reinstall melonloader using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe (Make sure to delete the existing Melonloader files first).\n";}
  if(body.includes("get_display")){resp+="A lot of custom tower mods broke in a recent BTD6 update. Remove the ones that are giving errors.\n";}
  if(body.includes("inject the same type twice, or use a different namespace")){resp+="2 mods are conflicting with each other because they use the same namespace. (this is a common problem with datjanedoe's old mods)\n";}
  if((body.includes("Could not resolve type with token") || body.includes("[ERROR] No Support Module Loaded!") || body.includes("NinjaKiwi.CT.API.dll") || body.includes("Critical failure when loading resources for mod BloonsTD6 Mod Helper")) && !body.includes("Monkeys for Hire") && !body.includes("2.3.1") && !body.includes("[Il2CppAssemblyGenerator] Moving NinjaKiwi.CT.API.dll")){resp+="Reinstall melonloader using the official installer: https://github.com/LavaGang/MelonLoader.Installer/releases/latest/download/MelonLoader.Installer.exe (Make sure to delete the existing Melonloader files first).\n";}
  if(body.includes("System.MissingMethodException")){resp+="A mod is trying to use a function that no longer exists. Remove that mod and/or check for a new version\n";}

  let respbackup=resp;
  let minorissues=0;
  resp += "\n*Minor Issues Found:*\n";

  mods.forEach((l) => {

  if (hasNumber(l)) {

    resp +="- Remove the numbers at the end of the file: " + l + "\n";
    minorissues++;
  }});
  if(minorissues==0){resp=respbackup;}
  return resp;
}

function parseMods(log) {
  let textByLine = log.split("\n");


  const regex = /Melon Assembly loaded: \'\.\\Mods\\(.*?)\'/;
  const mods = [];

  textByLine.forEach((l) => {
    try{mods.push(regex.exec(l)[1]);}catch{}
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
