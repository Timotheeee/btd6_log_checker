try {
	require.resolve("./config.json");
	var { githubToken } = require("./config.json");
} catch (e) {
	var githubToken = process.env.GITHUBTOKEN;
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

async function btd6mod(btd6modders) {
	let btd6mods = await octokit.rest.search.repos({
		q: "topic:btd6-mod",
		per_page: 100,
	});

	for (let item of btd6mods.data.items) {
		if (
			btd6modders.forceVerifiedOnly &&
			!btd6modders.verfied.includes(item.owner.login)
		) {
			console.log("Blocked: " + item.owner.login + " for " + item.name);
			continue;
		}
		let assets;
		let releases = await octokit.rest.repos.listReleases({
			owner: item.owner.login,
			repo: item.name,
			per_page: 100,
		});

		if (releases.data.length == 0) {
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
		for (let release of releases.data) {
			assets = await octokit.rest.repos.listReleaseAssets({
				owner: item.owner.login,
				repo: item.name,
				per_page: 100,
				release_id: release.id,
			});
			for (let asset of assets.data) {
				addtowhitelist(asset.name);
			}
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

	for (let item of btd6mods.data.items) {
		if (
			btd6modders.forceVerifiedOnly &&
			!btd6modders.verfied.includes(item.owner.login)
		) {
			console.log("Blocked: " + item.owner.login + " for " + item.name);
			continue;
		}
		let assets;
		let releases = await octokit.rest.repos.listReleases({
			owner: item.owner.login,
			repo: item.name,
			per_page: 100,
		});

		if (releases.data.length == 0) {
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
		for (let release of releases.data) {
			assets = await octokit.rest.repos.listReleaseAssets({
				owner: item.owner.login,
				repo: item.name,
				per_page: 100,
				release_id: release.id,
			});
			for (let asset of assets.data) {
				addtowhitelist(asset.name);
			}
		}
	}
}

async function createWhitelist() {
	const btd6modders = fetch(
		`https://raw.githubusercontent.com/gurrenm3/BTD-Mod-Helper/master/modders.json`
	).json();
	await btd6mod(btd6modders);
	await btd6mods(btd6modders);
	fs.writeFileSync("./nexus_cache/whitelist.txt", "");
	for (let item of dlls) {
		fs.appendFileSync("./nexus_cache/whitelist.txt", item + "\n");
	}
}
module.exports = { createWhitelist };