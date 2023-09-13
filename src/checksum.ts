import { getAddress } from "@ethersproject/address";
import { buildPath, tokens_directory } from ".";
import { writeFileSync } from "fs";
import { readJSONFile } from "./utils/jsonUtils";

const checksumAddresses = async (listName: string): Promise<void> => {
  let badChecksumCount = 0;
  const listToChecksum = readJSONFile(buildPath(tokens_directory,`${listName}.json`));

  const updatedList = listToChecksum.reduce((tokenList: any, token: any) => {
    const checksummedAddress = getAddress(token.id);
    if (checksummedAddress !== token.id) {
      badChecksumCount += 1;
      const updatedToken = { ...token, id: checksummedAddress };
      return [...tokenList, updatedToken];
    }
    return [...tokenList, token];
  }, []);

  if (badChecksumCount > 0) {
    console.info(`Found and fixed ${badChecksumCount} non-checksummed addreses`);
    const file = buildPath(tokens_directory,`${listName}.json`)
    console.info("Saving updated list");
    const stringifiedList = JSON.stringify(updatedList, null, 2);
    await writeFileSync(file, stringifiedList)
    console.info("Checksumming done!");
  } else {
    console.info("All addresses are already checksummed");
  }
};

export default checksumAddresses;
