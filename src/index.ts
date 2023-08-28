import { buildList, saveList, VersionBump } from "./buildList";
import checksumAddresses from "./checksum";
import ciCheck from "./ci-check";
// import topTokens from "./src/top-100.js";
// import fetchThirdPartyList from "./src/fetchThirdPartyList.js";
import { exec } from "child_process";
import { LISTS } from "./constants";
import * as path from 'path';

export const tokens_directory = "src/tokens"

const command = process.argv[2];
const listName = process.argv[3];
const versionBump = process.argv[4];

console.log({command,listName,versionBump});


function checkListName() {
  if (LISTS[listName as keyof typeof LISTS] === undefined) {

    throw new Error(`Unknown list: ${listName}. Please check src/constants.ts`);
  }
}

export const buildPath = (directory:string, fileName : string) => {
  const currentDirectory = `${path.dirname(__dirname)}/${directory}`;
  const filePath = path.join(currentDirectory, fileName);
  return filePath
}

async function dealCommand() {
  switch (command) {
    case "checksum":
      checkListName();
      await checksumAddresses(listName);
      break;
    case "generate":
      checkListName();
      await saveList(await buildList(listName, versionBump as VersionBump), listName);
      break;
    case "makelist":
      checkListName();
      await checksumAddresses(listName);
      await saveList(await buildList(listName, versionBump as VersionBump), listName);
      break;
    // case "fetch":
    //   checkListName();
    //   if (listName === "pcs-top-100") {
    //     await topTokens();
    //   }
    //   await fetchThirdPartyList(listName);
    //   break;
    case "ci-check":
      await ciCheck();
      break;
    default:
      console.info("Unknown command");
      break;
  }
}

 dealCommand()

