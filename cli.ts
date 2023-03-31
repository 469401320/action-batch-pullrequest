//node cli/cli.js --token <github_token> --branch 1.0 --repo kungfu --ver alpha

import { batchPullRequest, type argvs } from "./lib";

const yargs = require("yargs");
const cmdArgv = yargs(process.argv.slice(2))
  .option("token", { description: "token", type: "string", default: "" })
  .option("branch", { description: "branch", type: "string", default: "1.0" })
  .option("repo", { description: "repo", type: "string", default: "broker" })
  .option("ver", {
    description: "version",
    type: "string",
    default: "alpha",
  })
  .help()
  .parseSync();

const argv: argvs = {
  token: cmdArgv.token,
  branch: cmdArgv.branch,
  repo: cmdArgv.repo,
  version: cmdArgv.ver,
};
batchPullRequest(argv).catch(console.error);
