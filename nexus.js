const fetch = require("sync-fetch");
const fs = require("fs");

try {
	require.resolve("./config.json");
	var { nexusKey } = require("./config.json");
} catch (e) {
	var nexusKey = process.env.nexusKey;
}

function cacheNexusFiles() {
	if (!fs.existsSync("./ScannerFiles/nexusmods.txt")) {
		fs.writeFileSync("./ScannerFiles/nexusmods.txt", "");
	}

	function countFileLines(filePath) {
		return fs.readFileSync(filePath).toString().split("\n").length;
	}

	//console.log("File Lines: " + countFileLines("./ScannerFiles/nexusmods.txt"));

	for (let i = countFileLines("./ScannerFiles/nexusmods.txt"); ; i++) {
		console.log(
			"Fetching page " +
				`https://api.nexusmods.com/v1/games/bloonstd6/mods/${i}/files.json` +
				" of Nexus data"
		);
		const url = `https://api.nexusmods.com/v1/games/bloonstd6/mods/${i}/files.json`;

		const headers = {
			accept: "application/json",
			apikey: nexusKey,
		};

		const response = fetch(url, { method: "GET", headers: headers });
		console.log(response.headers.get("x-rl-hourly-remaining"));
		console.log(response.headers.get("x-rl-hourly-limit"));
		console.log(response.headers.get("x-rl-hourly-reset"));
		console.log(response.headers.get("x-rl-daily-remaining"));
		console.log(response.headers.get("x-rl-daily-limit"));
		console.log(response.headers.get("x-rl-daily-reset"));
		if (response.status == 404) {
			break;
		}
		if (response.status == 403) {
			fs.appendFileSync(`./ScannerFiles/nexusmods.txt`, "\n");
		}
		if (response.status == 200) {
			const json = JSON.parse(JSON.stringify(response.json()));

			const filedata = fetch(
				json.files[json.files.length - 1].content_preview_link,
				{ method: "GET", headers: headers }
			);
			const json2 = JSON.parse(JSON.stringify(filedata.json()));

			try {
				json2.children.forEach(myFunction);
			} catch {}

			function myFunction(item, index, arr) {
				fs.appendFileSync(
					`./ScannerFiles/nexusmods.txt`,
					arr[index].path
				);
				//console.log(arr[index].path);
			}

			fs.appendFileSync(`./ScannerFiles/nexusmods.txt`, "\n");
		}
	}
}

function nexusList(mods) {
	let text = fs.readFileSync("./ScannerFiles/nexusmods.txt", "utf-8");
	let whitelist = fs.readFileSync("./ScannerFiles/githubwhitelist.txt", "utf-8");
	let manualwhitelist = fs.readFileSync("./ScannerFiles/manualwhitelist.txt", "utf-8");
	let manualblacklist = fs.readFileSync("./ScannerFiles/manualblacklist.txt", "utf-8");
	let nexusMods = [];

	for (let element of mods) {
		let element1 = element.replace(/ \(\d+\)/, "");
		
		if ((text.includes(element1) && !whitelist.includes(element1) && !manualwhitelist.includes(element1)) || manualblacklist.includes(element1)) {
			nexusMods.push(element);
		}
	}
	return nexusMods;
}

function isInModCache(item) {
	let text = fs.readFileSync("./ScannerFiles/nexusmods.txt", "utf-8");
	let textByLine = text.split("\n");
	let result = false;
	if (textByLine.includes(item)) {
		result = true;
	}
	return result;
}

module.exports = { nexusList, cacheNexusFiles, isInModCache };
