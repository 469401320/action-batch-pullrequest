import { getOctokit } from "@actions/github";
import { Octokit } from "@octokit/rest";

export type argvs = {
  token: string;
  branch: string;
  repo: string;
  version: string;
};

const sleep = function (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function getReops(argv: argvs): Promise<Map<string, string>> {
  const octokit = new Octokit({
    auth: `${argv.token}`,
  });
  let currentPage = 1; //当前页，初始化为1
  const maxPerPage = 100;
  const repoList = new Map<string, string>();
  while (true) {
    const repos = await octokit.rest.repos.listForOrg({
      org: "kungfu-trader",
      per_page: maxPerPage,
      page: currentPage,
    });
    repos.data.forEach((it) => {
      repoList.set(it.name, it.owner.login);
    });
    if (repos.data.length < maxPerPage) {
      break;
    }
    currentPage++;
  }
  console.log(repoList.size, " repositories");
  return repoList;
}

export async function creatPullRequest(token: string, repo: string, head: string, base: string) {
  const octokit = new Octokit({
    auth: token,
  });

  try{
    await octokit.request(`POST /repos/kungfu-trader/${repo}/pulls`, {
      owner: 'kungfu-trader',
      repo: repo,
      title: 'new pull request',
      body: 'new pull request body',
      head: head,
      base: base,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  }catch(e){
    console.log(`pull request for repo ${repo} fail`);
  }
}

export async function batchPullRequest(argv: argvs) {
  const repos = await getReops(argv);
  let prefix = "";
  let prefixUi = "";
  switch (argv.repo) {
    case "broker":
        prefix = "kfx-broker";
        break;
    case "task":
        prefix = "kfx-task"
        prefixUi = "kfx-ui";
        break;
    case "kungfu":
        prefix = "kungfu";
        break;
    case "trader":
        prefix = "kungfu-trader";
        break;
    default:
        break;
  }
  if(prefix == ""){
    return;
  }
  let head = "dev/v1/v1.0";
  let base = "alpha/v1/v1.0";
  let mainVer = "1";
  let branch = argv.branch;

  if(argv.repo == "kungfu"){
    mainVer = "2";
    branch = (Number(branch) + 1.4).toString();
  }
  if(argv.version == "alpha"){
    head = `dev/v${mainVer}/v` + branch;
    base = `alpha/v${mainVer}/v` + branch;
  }else if(argv.version == "release"){
    head = `alpha/v${mainVer}/v` + branch;
    base = `release/v${mainVer}/v` + branch;
  }
  console.log("head", head, "base", base);

  let f = true;

  for (const [repoName, name] of repos) {
      let match = false;
      if (prefix == "kungfu") {
        if (repoName == prefix) {
          match = true;
        }
      } else {
        if (repoName.startsWith(prefix) || (prefixUi && repoName.startsWith(prefixUi))) {
          match = true;
        }
      }
      if(match && f){
        console.log(`repo ${repoName} match ${match}`);
        await creatPullRequest(argv.token, repoName, head, base);
        await sleep(700);
        f = false;
      }
  }

}