import fs from "fs";
import path from "path";
import _ from "lodash";

import { publicClients } from "./publicClients";
import { Address } from "viem";
import { erc20ABI } from "./abi/erc20";

export const ERC20_ABI = [
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event UnBlacklisted(address indexed _account)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)',
] as const;
const getTokensChainData = async (listName: string, addressArray: string[], chainId?: number , isSave: boolean = false): Promise<any[]> => {
  const tokens: Address[] = addressArray as Address[]
  
  if (!tokens) {
    console.error("No raw address list found");
    return [];
  }

  const chunkSize = 200;
  const chunkArray = tokens.length >= chunkSize ? _.chunk(tokens, chunkSize) : [tokens];

  const tokensWithChainData = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const chunk of chunkArray) {
    const tokenInfoCalls = chunk.flatMap((address) => [
      {
        address,
        name: "symbol",
      },
      {
        address,
        name: "name",
      },
      {
        address,
        name: "decimals",
      },
    ]);
      
    const publicClient = publicClients[chainId as keyof typeof publicClients];
    console.log("publicClient" , publicClient.chain);

    // eslint-disable-next-line no-await-in-loop
    const tokenInfoResponse = await publicClient.multicall({
      allowFailure: true,
      contracts: chunk.flatMap((address) => [
        {
          abi: erc20ABI,
          address,
          functionName: "symbol",
        },
        // {
        //   abi: erc20ABI,
        //   address,
        //   functionName: "name",
        // },
        // {
        //   abi: erc20ABI,
        //   address,
        //   functionName: "decimals",
        // },
      ]
      ),
    });
    console.log("tokenInfoResponse: ", tokenInfoResponse);
      
    // const tokenInfoResponse = await multicallv2(erc20, tokenInfoCalls, undefined, chainId);
    const data = chunk.map((address, i) => ({
      name: tokenInfoResponse?.[i * 3 + 1]?.result ?? "",
      symbol: tokenInfoResponse?.[i * 3]?.result ?? "",
      address,
      chainId,
      decimals: tokenInfoResponse[i * 3 + 2]?.result,
      logoURI: `https://assets-cdn.trustwallet.com/blockchains/smartchain/assets/${address}/logo.png`,
    }));
    tokensWithChainData.push(...data);
  }

  if (isSave) {
    const tokenListPath = `${path.resolve()}/src/tokens/${listName}.json`;
    const stringifiedList = JSON.stringify(tokensWithChainData, null, 2);
    fs.writeFileSync(tokenListPath, stringifiedList);
    console.info("Generated token list source json to ", tokenListPath);
  }
  return tokensWithChainData;
};

export default getTokensChainData;
