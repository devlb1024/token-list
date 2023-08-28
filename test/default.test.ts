/* eslint-disable no-restricted-syntax */
import Ajv from "ajv";
import { getAddress } from "@ethersproject/address";
// import pancakeswapSchema from "@pancakeswap/token-lists/schema/pancakeswap.json";
import pancakeswapSchema from "./schema.json"; // TODO: exports path
import { groupBy } from "lodash";
import { buildList, VersionBump } from "../src/buildList";
import getTokenChainData from "../src/utils/getTokensChainData";
import { LISTS } from "../src/constants";
import { readJSONFile } from "../src/utils/jsonUtils";
import { buildPath } from "../src";


const ajv = new Ajv({ allErrors: true, format: "full" });
const validate = ajv.compile(pancakeswapSchema);

const getByAjvPath = (obj, propertyPath: string, defaultValue = undefined) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(propertyPath.substring(1), regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

function toBeDeclaredOnce(received, type: string, parameter: string, chainId: number) {
  if (typeof received === "undefined") {
    return {
      message: () => ``,
      pass: true,
    };
  }
  return {
    message: () => `Token ${type} ${parameter} on chain ${chainId} should be declared only once.`,
    pass: false,
  };
}

function toBeValidTokenList(tokenList) {
  
  const isValid = validate(tokenList);
  if (isValid) {
    return {
      message: () => ``,
      pass: true,
    };
  }else{
    console.log("error: ", tokenList);
    console.log("error: ", validate.errors);
    
  }

  const validationSummary = validate.errors
    ?.map((error) => {
      const value = getByAjvPath(tokenList, error.dataPath);
      return `- ${error.dataPath.split(".").pop()} ${value} ${error.message}`;
    })
    .join("\n");
  return {
    message: () => `Validation failed:\n${validationSummary}`,
    pass: false,
  };
}

const currentLists = {};
const cases = LISTS["kurama-test"]
const defaultTokenList = readJSONFile(buildPath("lists" ,`${cases.name}.json` ));

describe("buildList %s",  () => {
  
  it("validates", () => {
   
    expect(toBeValidTokenList(defaultTokenList).pass).toBe(true)
  });

  it("contains no duplicate addresses", () => {
    const map = {};
    for (const token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.address.toLowerCase()}`;
      expect(toBeDeclaredOnce(map[key], "address", token.address.toLowerCase(), token.chainId).pass).toBe(true)
      map[key] = true;
    }
  });

  it("contains no duplicate names",  () => {
    const map = {};
    for (const token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.name}`;

      expect(toBeDeclaredOnce(map[key], "name", token.name, token.chainId).pass).toBe(true)
      map[key] = true;
    }
  });

  it("all addresses are valid and checksummed", () => {
      for (const token of defaultTokenList.tokens) {
        expect(token.address).toBe(getAddress(token.address));
      }
  });

  it(
    "all tokens have correct decimals",
     async () => {
        const groupByChainId = groupBy(defaultTokenList.tokens, (x) => x.chainId);
        for (const [chainId, tokens] of Object.entries(groupByChainId)) {
          
          const tokensChainData = await getTokenChainData(
            "test",
            tokens.map((t) => t.address),
            Number(chainId)
          );
          for (const token of tokens) {
            const realDecimals = tokensChainData.find(
              (t) => t.address.toLowerCase() === token.address.toLowerCase()
            )?.decimals;
            expect(token.decimals).toBeGreaterThanOrEqual(0);
            expect(token.decimals).toBeLessThanOrEqual(255);
            expect(token.decimals).toEqual(realDecimals);
          }
    }
   
  });
});
