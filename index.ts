import { getReops } from "./lib";
import { getInput, setFailed } from "@actions/core";

const main = async function () {
  const argv = {
    token: getInput("token"),
    branch: getInput("branch"),
    repo: getInput("repo"),
    version: getInput("version"),
  };
  console.log(argv.token.length, argv.branch, argv.repo, argv.version);
  await getReops(argv);
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    setFailed(error.message);
  });
}
