try {
	require.resolve("./config.json");
	var { githubToken } = require("./config.json");
} catch (e) {
	var githubToken = process.env.githubToken;
}
const fetch = require("sync-fetch");
const fs = require("fs");

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
	auth: githubToken,
});
var dlls = [];
function addtowhitelist(item) {
	if (!dlls.includes(item) && item.endsWith(".dll")) {
		dlls.push(item);
	}
}

async function btd6mod(btd6modders) {
	let btd6mod = await octokit.rest.search.repos({
		q: "topic:btd6-mod",
		per_page: 100,
	});
	for (let item of btd6mod.data.items) {
		if (
			btd6modders.forceVerifiedOnly &&
			!btd6modders.verfied.includes(item.owner.login)
		) {
			console.log("Blocked: " + item.owner.login + " for " + item.name);
			continue;
		}
		try {
			let release = await octokit.request(
				"GET /repos/{owner}/{repo}/releases/latest",
				{
					owner: item.owner.login,
					repo: item.name,
				}
			);
			addtowhitelist(release.data.assets[0].name);
		} 
		catch (RequestError) {
			let latestcommit = await octokit.request(
				"GET /repos/{owner}/{repo}/git/refs/heads/{ref}",
				{
					owner: item.owner.login,
					repo: item.name,
					ref: item.default_branch,
				}
			);
			let object = await octokit.rest.git.getCommit({
				owner: item.owner.login,
				repo: item.name,
				commit_sha: latestcommit.data.object.sha,
			});
			let tree = await octokit.request(
				"GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
				{
					owner: item.owner.login,
					repo: item.name,
					tree_sha: object.data.tree.sha,
				}
			);
			await searchtrees(tree.data.tree, item);
		}
	}
}

async function btd6mods(btd6modders) {
	function addtowhitelist(item) {
		if (!dlls.includes(item) && item.endsWith(".dll")) {
			dlls.push(item);
		}
	}
	let btd6mods = await octokit.rest.search.repos({
		q: "topic:btd6-mods",
		per_page: 100,
	});
	console.log("items2: "+btd6mods.data.items);

	for (let item of btd6mods.data.items) {
		console.log(item.owner.login);
		if (
			btd6modders.forceVerifiedOnly &&
			!btd6modders.verfied.includes(item.owner.login)
		) {
			console.log("Blocked: " + item.owner.login + " for " + item.name);
			continue;
		}

		try {
			let release = await octokit.request(
				"GET /repos/{owner}/{repo}/releases/latest",
				{
					owner: item.owner.login,
					repo: item.name,
				}
			);
			addtowhitelist(release.data.assets[0].name);
		} catch (RequestError) {
			console.log("No release found for " + item.name +"by" + item.owner.login);
			let latestcommit = await octokit.request(
				"GET /repos/{owner}/{repo}/git/refs/heads/{ref}",
				{
					owner: item.owner.login,
					repo: item.name,
					ref: item.default_branch,
				}
			);
			let object = await octokit.rest.git.getCommit({
				owner: item.owner.login,
				repo: item.name,
				commit_sha: latestcommit.data.object.sha,
			});
			let tree = await octokit.request(
				"GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
				{
					owner: item.owner.login,
					repo: item.name,
					tree_sha: object.data.tree.sha,
				}
			);
			await searchtrees(tree.data.tree, item);
		}
	}
}
async function searchtrees(tree, mod) {
	for (let item of tree) {
		if (item.type == "tree") {
			let trees = await octokit.request(
				"GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
				{
					owner: mod.owner.login,
					repo: mod.name,
					tree_sha: item.sha,
				}
			);
			searchtrees(trees.data.tree, mod);
		}
		if (item.type == "blob") {
			addtowhitelist(item.path);
		}
	}
}

async function createWhitelist() {
	const btd6modders = fetch(
		`https://raw.githubusercontent.com/gurrenm3/BTD-Mod-Helper/master/modders.json`
	).json();
	
	await btd6mods(btd6modders);
	await btd6mod(btd6modders);

	await addmodstowhitelist();

	fs.writeFileSync("./ScannerFiles/githubwhitelist.txt", "");

	for (let item of dlls) {
		fs.appendFileSync("./ScannerFiles/githubwhitelist.txt", item + "\n");
	}
}
async function createVersionList() {

}
async function addmodstowhitelist() {
	let latestcommit = await octokit.request(
		"GET /repos/{owner}/{repo}/git/refs/heads/{ref}",
		{
			owner: "DatJaneDoe",
			repo: "BTD6-Mods",
			ref: "main",
		}
	);
	let object = await octokit.rest.git.getCommit({
		owner: "DatJaneDoe",
		repo: "BTD6-Mods",
		commit_sha: latestcommit.data.object.sha,
	});
	let tree = await octokit.request(
		"GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
		{
			owner: "DatJaneDoe",
			repo: "BTD6-Mods",
			tree_sha: object.data.tree.sha,
		}
	);
	for (let item of tree.data.tree) {
		if (item.type == "blob") {
			addtowhitelist(item.path);
		}
	}
	if (!fs.existsSync("./ScannerFiles/manualwhitelist.txt")) {
		fs.writeFileSync("./ScannerFiles/manualwhitelist.txt", "");
	}
	if (!fs.existsSync("./ScannerFiles/manualblacklist.txt")) {
		fs.writeFileSync("./ScannerFiles/manualblacklist.txt", "");
	}
}
module.exports = { createWhitelist };
