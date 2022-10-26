const fetch = require("sync-fetch");
const fs = require("fs");

try {
  require.resolve("./config.json");
  var { nexusKey } = require("./config.json");
  var { githubToken } = require("./config.json");
} catch (e) {
  var nexusKey = process.env.NEXUSKEY;
  var githubToken = process.env.GITHUBTOKEN;
}

async function createWhitelist() {
  fs.writeFileSync("./nexus_cache/whitelist.txt", "");

  const { Octokit } = require("@octokit/rest");
  const octokit = new Octokit({
    auth: githubToken,
  });

  let btd6mods = await octokit.rest.search.repos({
    q: "topic:btd6-mod",
    per_page: 100,
  });

  let btd6repos = await octokit.rest.search.repos({
    q: "topic:btd6-mods",
    per_page: 100,
  });

  const btd6modders = fetch(
    `https://raw.githubusercontent.com/gurrenm3/BTD-Mod-Helper/master/modders.json`
  ).json();

  for (let item of btd6mods.data.items) {
    if (
      btd6modders.forceVerifiedOnly &&
      !btd6modders.verfied.includes(item.owner.login)
    ) {
      console.log("Blocked: " + item.owner.login + " for " + item.name);
      continue;
    }
    let assets;
    let addedassets = [];
    let files = [];
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
      for (let file of tree.data.tree) {
        if (file.type == "blob") {
          if (!file.path.endsWith(".dll")) {
            continue;
          }
          if (!addedassets.includes(file.path)) {
            fs.appendFileSync(`./nexus_cache/whitelist.txt`, file.path + "\n");
            addedassets.push(file.path);
          }
        } else if (file.type == "tree") {
          let subtrees = await octokit.request(
            "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
            {
              owner: item.owner.login,
              repo: item.name,
              tree_sha: file.sha,
            }
          );
          for (let subtree of subtrees.data.tree) {
            if (!subtree.path.endsWith(".dll")) {
              continue;
            }
            if (!addedassets.includes(subtree.path)) {
              fs.appendFileSync(
                `./nexus_cache/whitelist.txt`,
                subtree.path + "\n"
              );
              addedassets.push(subtree.path);
            }
          }
        }
      }
    }

    for (let release of releases.data) {
      assets = await octokit.rest.repos.listReleaseAssets({
        owner: item.owner.login,
        repo: item.name,
        per_page: 100,
        release_id: release.id,
      });
      for (let asset of assets.data) {
        if (!asset.name.endsWith(".dll")) {
          continue;
        }
        if (!addedassets.includes(asset.name)) {
          fs.appendFileSync(`./nexus_cache/whitelist.txt`, asset.name + "\n");
          addedassets.push(asset.name);
        }
      }
    }
  }
}

function cacheNexusFiles() {
  if (!fs.existsSync("./nexus_cache/filecache.txt")) {
    fs.writeFileSync("./nexus_cache/filecache.txt", "");
  }

  function countFileLines(filePath) {
    return fs.readFileSync(filePath).toString().split("\n").length;
  }

  console.log("File Lines: " + countFileLines("./nexus_cache/filecache.txt"));

  for (let i = countFileLines("./nexus_cache/filecache.txt"); ; i++) {
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
      fs.appendFileSync(`./nexus_cache/filecache.txt`, "\n");
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
        fs.appendFileSync(`./nexus_cache/filecache.txt`, arr[index].path);
        console.log(arr[index].path);
      }

      fs.appendFileSync(`./nexus_cache/filecache.txt`, "\n");
    }
  }
}

function nexusList(mods) {
  const badmods = [];
  let text = fs.readFileSync("./nexus_cache/filecache.txt", "utf-8");
  let textByLine = text.split("\n");
  let whitelist = fs.readFileSync("./nexus_cache/whitelist.txt", "utf-8");
  let whitelistByLine = whitelist.split("\n");

  for (let element of mods) {
    let element1 = element.replace(/ \(\d\)/, "");
    if (textByLine.includes(element1) && !whitelistByLine.includes(element1)) {
      badmods.push(element);
    }
  }
  return badmods;
}

function isInModCache(item) {
  let text = fs.readFileSync("./nexus_cache/filecache.txt", "utf-8");
  let textByLine = text.split("\n");
  let result = false;
  if (textByLine.includes(item)) {
    result = true;
  }
  return result;
}

module.exports = { nexusList, cacheNexusFiles, isInModCache, createWhitelist };
