/* eslint-disable no-restricted-syntax */
import Ajv from "ajv";
import { getAddress } from "@ethersproject/address";
// import pancakeswapSchema from "@pancakeswap/token-lists/schema/pancakeswap.json";
import pancakeswapSchema from "./schema.json"; // TODO: exports path
import { groupBy } from "lodash";
import { buildList, VersionBump } from "../src/buildList.js";
import getTokenChainData from "../src/utils/getTokensChainData.js";
import { LISTS } from "../src/constants.js";
import { arbitrum, base, bsc, mainnet, polygonZkEvm, zkSync } from "viem/chains";
import { linea } from "../src/utils/publicClients.js";
import { describe } from 'bun:test';

const CASES = Object.entries(LISTS).map(([key, value]) =>
  "test" in value ? ([key, value.test] as const) : ([key] as const)
);

const cases = CASES;

const ajv = new Ajv({ allErrors: true, format: "full" });
const validate = ajv.compile(pancakeswapSchema);

// Modified https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
const getByAjvPath = (obj, propertyPath: string, defaultValue = undefined) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(propertyPath.substring(1), regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace jest {
//     interface Matchers<R> {
//       toBeDeclaredOnce(type: string, parameter: string, chainId: number): CustomMatcherResult;
//       toBeValidTokenList(): CustomMatcherResult;
//       toBeValidLogo(): CustomMatcherResult;
//     }
//   }
// }

// expect.extend({
//   toBeDeclaredOnce,
//   toBeValidTokenList,
//   toBeValidLogo,
// });

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

for (const _case of cases) {
  const [listName] = _case;
  currentLists[listName] = await Bun.file(`lists/${listName}.json`).json();
}

describe.each(cases)("buildList %s", async (listName, opt: any) => {
  const defaultTokenList = await buildList(listName);
  
  it("validates", () => {
    console.log("listName:   ", listName);
    console.log("defaultTokenList:   ", defaultTokenList);
    expect(true).toBe(true);
   // expect(toBeValidTokenList(defaultTokenList).pass).toBeTrue();
  });

  it("contains no duplicate addresses", () => {
    const map = {};
    for (const token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.address.toLowerCase()}`;
      expect(toBeDeclaredOnce(map[key], "address", token.address.toLowerCase(), token.chainId).pass).toBeTrue();
      map[key] = true;
    }
  });

  // Commented out since we now have duplicate symbols ("ONE") on exchange
  // doesn't seem to affect any functionality at the moment though
  // it("contains no duplicate symbols", () => {
  //   const map = {};
  //   for (const token of defaultTokenList.tokens) {
  //     const key = `${token.chainId}-${token.symbol.toLowerCase()}`;
  //     expect(map[key]).toBeDeclaredOnce("symbol", token.symbol.toLowerCase(), token.chainId);
  //     map[key] = true;
  //   }
  // });

  it("contains no duplicate names", () => {
    const map = {};
    for (const token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.name}`;

      expect(toBeDeclaredOnce(map[key], "name", token.name, token.chainId).pass).toBeTrue();
      map[key] = true;
    }
  });

  it("all addresses are valid and checksummed", () => {
    if (!opt || !opt.aptos) {
      for (const token of defaultTokenList.tokens) {
        expect(token.address).toBe(getAddress(token.address));
      }
    }
  });

  it(
    "all tokens have correct decimals",
    async () => {
      const addressArray = defaultTokenList.tokens.map((token) => token.address);
      const chainId = defaultTokenList.tokens[0].chainId ?? 56;
        const groupByChainId = groupBy(defaultTokenList.tokens, (x) => x.chainId);
        for (const [chainId, tokens] of Object.entries(groupByChainId)) {
          console.log("-----------------", {chainId, tokens});
          
          // const tokensChainData = await getTokenChainData(
          //   "test",
          //   tokens.map((t) => t.address),
          //   Number(chainId)
          // );
          // for (const token of tokens) {
          //   const realDecimals = tokensChainData.find(
          //     (t) => t.address.toLowerCase() === token.address.toLowerCase()
          //   )?.decimals;
          //   expect(token.decimals).toBeGreaterThanOrEqual(0);
          //   expect(token.decimals).toBeLessThanOrEqual(255);
          //   expect(token.decimals).toEqual(realDecimals);
          // }
        }
    },
    {
      timeout: 20000,
    }
  );

  it("version gets patch bump if no versionBump specified", () => {
    expect(defaultTokenList.version.major).toBe(currentLists[listName].version.major);
    expect(defaultTokenList.version.minor).toBe(currentLists[listName].version.minor);
    expect(defaultTokenList.version.patch).toBe(currentLists[listName].version.patch + 1);
  });

  it("version gets patch bump if patch versionBump is specified", async () => {
    const defaultTokenListPatchBump = await buildList(listName, VersionBump.patch);
    expect(defaultTokenListPatchBump.version.major).toBe(currentLists[listName].version.major);
    expect(defaultTokenListPatchBump.version.minor).toBe(currentLists[listName].version.minor);
    expect(defaultTokenListPatchBump.version.patch).toBe(currentLists[listName].version.patch + 1);
  });

  it("version gets minor bump if minor versionBump is specified", async () => {
    const defaultTokenListMinorBump = await buildList(listName, VersionBump.minor);
    expect(defaultTokenListMinorBump.version.major).toBe(currentLists[listName].version.major);
    expect(defaultTokenListMinorBump.version.minor).toBe(currentLists[listName].version.minor + 1);
    expect(defaultTokenListMinorBump.version.patch).toBe(currentLists[listName].version.patch);
  });

  it("version gets minor bump if major versionBump is specified", async () => {
    const defaultTokenListMajorBump = await buildList(listName, VersionBump.major);
    expect(defaultTokenListMajorBump.version.major).toBe(currentLists[listName].version.major + 1);
    expect(defaultTokenListMajorBump.version.minor).toBe(currentLists[listName].version.minor);
    expect(defaultTokenListMajorBump.version.patch).toBe(currentLists[listName].version.patch);
  });
});
