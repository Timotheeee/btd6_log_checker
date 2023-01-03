const fs = require("fs");
const nexus = require("./nexus.js");
function hasNumber(myString) {
	return / \(\d+\)/.test(myString);
}
function parseMisc(log, name) {
	let body = log;
	let resp = "";
	if (name) {
		resp +=
			"- Make sure you are sending the latest log, it can be found within the MelonLoader folder, which is in the BTD6 folder, as a file named `Latest.log`. You can find out more information by typing `!log`.\n";
	}
	if (body.includes("BloonsTD6 Mod Helper v2.3.1")) {
		resp +=
			"- You got the mod helper from nexus. That version is completely outdated, get the new one [here](https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll)\n";
	}
	if (body.includes("get_display")) {
		resp +=
			"- A lot of custom tower mods broke in a recent BTD6 update. Remove the ones that are giving errors.\n";
	}

	if (
		(body.includes("BloonsTD6 Mod Helper.dll") ||
			body.includes("BloonsTD6_Mod_Helper.dll") ||
			body.includes("BloonsTD6 Mod Helper v3.0.0")) &&
		!body.includes("v2.3.1") &&
		!body.includes("BloonsTD6 Mod Helper v3.1.0")
	) {
		resp +=
			"- Your mod helper is outdated. Get the new version [here.](https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll)\n";
	}
	if (body.includes("get_RegisteredMelons")) {
		resp +=
			"- Reinstall MelonLoader using the [guide](https://hemisemidemipresent.github.io/btd6-modding-tutorial/). (Make sure to delete the existing Melonloader files first).\n";
	}
	if (
		(body.includes("SHA256 Hash") ||
			body.includes("Loading Melon Assembly")) &&
		!body.includes("Helper")
	) {
		resp +=
			"- You need mod helper. Download it [here.](https://github.com/gurrenm3/BTD-Mod-Helper/releases/latest/download/Btd6ModHelper.dll)\n";
	}
	if (body.includes("MainMenu_OnEnable::Postfix()")) {
		resp += "- Gurren's old mods are broken\n";
	}
	if (body.includes("MelonLoader v0.5.4") || body.includes("MelonLoader v0.5.5") || body.includes("MelonLoader v0.5.7")) {
		resp +=
			"- You need MelonLoader v0.6.0(or higher), you need to install following the guide [here](https://hemisemidemipresent.github.io/btd6-modding-tutorial/). (Make sure to delete the existing Melonloader files first)\n";
	}
	if (body.includes("NKHook6")) {
		resp += "- NKHook6 and all the mods that rely on it are broken\n";
	}
	if (body.includes("Gurren Core")) {
		resp += "- Gurren Core and all the mods that rely on it are broken\n";
	}
	if (body.includes("[BloonsTD6_Mod_Helper] Failed to register text")) {
		resp +=
			"- A custom tower/paragon mod failed to load, it's probably broken/outdated.\n";
	}
	if (body.includes("inject the same type twice, or use a different namespace"))
	{
		resp +=
			"- 2 mods are conflicting with each other because they use the same namespace. (this is a common problem with DatJaneDoe's old mods)\n";
	}
	if (
		body.includes("Could not load file or assembly") &&
		!body.includes("PresentationFramework")
	) {
		resp +=
			"- Your antivirus deleted a melonloader file. Reinstall melonloader following the [guide](https://hemisemidemipresent.github.io/btd6-modding-tutorial/) and add an exception to your antivirus. Make sure to delete the existing Melonloader files first.\n";
	}
	if (
		(body.includes("Could not resolve type with token") ||
			body.includes("[ERROR] No Support Module Loaded!") ||
			body.includes("NinjaKiwi.CT.API.dll") ||
			body.includes(
				"Critical failure when loading resources for mod BloonsTD6 Mod Helper"
			)) &&
		!body.includes("Monkeys for Hire") &&
		!body.includes("2.3.1") &&
		!body.includes("[Il2CppAssemblyGenerator] Moving NinjaKiwi.CT.API.dll")
	) {
		resp +=
		"- Reinstall MelonLoader using the [guide](https://hemisemidemipresent.github.io/btd6-modding-tutorial/). (Make sure to delete the existing Melonloader files first).\n";
	}
	if (body.includes("[ERROR] System.ComponentModel.Win32Exception")) {
		resp +=
		"- Reinstall MelonLoader using the [guide](https://hemisemidemipresent.github.io/btd6-modding-tutorial/). (Make sure to delete the existing Melonloader files first).\n";
	}
	if (body.includes("Failed to Download UnityDependencies!") || body.includes(" System.Net.Sockets.SocketException")) {
		resp +=
		"- Open the \"Change Proxy Settings\" settings window and disable all three toggles.\n";
	}
	let textByLine = log.split("\n");
	let respondedmods = [];
	for (const element of textByLine) {
		let line = element;
		if (/Failed to load all types in assembly (.*?)/.test(line)) {
			let assembly = /Failed to load all types in assembly (.*?), /.exec(line)[1];
			if (!respondedmods.includes(assembly))
			{
				resp += "- `" + assembly +"` is outdated and will not work. Check mod browser or the modding servers for a new version."+ "\n";
				respondedmods.push(assembly);
			}
		}
	}
	return resp;
}
function parseSuggestions(log) {
	const mods = parseMods(log);
	let resp = "";
	mods.forEach((l) => {
		if (hasNumber(l)) {
			resp += "- Remove the numbers at the end of the file: " + l + "\n";
		}
		if (l.includes("GoldVillage.dll")) {
			resp +=
				"- GoldVillage takes a long time to load on start, it may look like your game is crashing/freezing, but you just need to wait.\n";
		}
	});
	return resp;
}
function parseModInfo(log) {
	let textByLine = log.split("\n");
	let mods = {};
	for (let i = 0; i < textByLine.length; i++) {
		let versionRegex = / v(\d+\.\d+\.\d+)/;
		let authorRegex = /.*? by (.*?)\r/;
		let dllRegex = /Assembly: (.*?)\r/;
		if (
			versionRegex.test(textByLine[i]) &&
			authorRegex.test(textByLine[i + 1]) &&
			dllRegex.test(textByLine[i + 2])
		) 
		{
			let version = versionRegex.exec(textByLine[i])[1];
			let author = authorRegex.exec(textByLine[i + 1])[1];
			let dll = dllRegex.exec(textByLine[i + 2])[1];
			let modinfo = [version, author];
			mods[dll] = modinfo;
		}
	}
	return mods;
}
function parseModInfoString(log) {
	let textByLine = log.split("\n");
	let mods = [];
	for (let i = 0; i < textByLine.length; i++) {
		let versionRegex = / v(\d+\.\d+\.\d+)/;
		let authorRegex = /.*? by (.*?)\r/;
		let dllRegex = /Assembly: (.*?)\r/;
		if (
			versionRegex.test(textByLine[i]) &&
			authorRegex.test(textByLine[i + 1]) &&
			dllRegex.test(textByLine[i + 2])
		) 
		{
			let version = versionRegex.exec(textByLine[i])[1];
			let author = authorRegex.exec(textByLine[i + 1])[1];
			let dll = dllRegex.exec(textByLine[i + 2])[1];
			mods.push(dll + " v" + version + " by " + author);
		}
	}
	return mods;
}

function parseMods(log) {
	const mods = [];

	for (let key in parseModInfo(log)) {
		mods.push(key);
	}

	return mods;
}
function parseOutdated(log) {
	return;
}
function isLog(log) {
	return (
		log.includes("Game Name: BloonsTD6") &&
		log.includes("MelonLoader") &&
		log.includes("BloonsTD6") &&
		log.includes("Game Developer: Ninja Kiwi")
	);
}
function getMatches(string, regex, index) {
	index || (index = 1); // default to the first capturing group
	var matches = [];
	var match;
	while ((match = regex.exec(string))) {
		matches.push(match[index]);
	}
	return matches;
}
function parseErrors(log) {
	let regex = /\] \[(.*?)\] \[ERROR\]/gi;
	const mods = [];
	getMatches(log, regex, 1).forEach((l) => {
		let mod = l;
		if (!mods.includes(mod)) {
			mods.push(mod);
		}
	});
	return mods;
}

module.exports = {
	parseMisc,
	isLog,
	parseMods,
	parseErrors,
	parseSuggestions,
	parseOutdated,
	parseModInfo,
	parseModInfoString,
};
