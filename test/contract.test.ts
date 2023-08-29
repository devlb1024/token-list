import { createTestClient, createWalletClient, getAddress, getContract, http, parseAbi } from "viem";
import { erc20ABI } from "../src/utils/abi/erc20";
import { publicClients } from "../src/utils/publicClients";
import { privateKeyToAccount } from 'viem/accounts'
import { foundry, scrollSepolia } from "viem/chains";

describe("contract", () => {
  it("getContract", async () => {
    const publicClient = publicClients[534351];

    const contract = getContract({
      address: "0x3d38d54CbD0F6d90Cc3f861cd05e7F5d223Fb9Fe",
      abi: erc20ABI,
      publicClient,
    });

    const [name, totalSupply, symbol, decimals] = await Promise.all([
      contract.read.name(),
      contract.read.totalSupply(),
      contract.read.symbol(),
      contract.read.decimals(),
    ])
    console.log("result: ", {name, totalSupply, symbol, decimals});
    const chainId  = await publicClient.getChainId()
    console.log("chainId : ", {chainId });
  });

  it("createWalletClient", async () => {

    const json = parseAbi([
      'constructor(string symbol, string name)',
      'function transferFrom(address from, address to, uint amount)',
      'function transferFrom(address from, address to, uint amount, bool x)',
      'function mint(uint amount) payable',
      'function balanceOf(address owner) view returns (uint)',
      'event Transfer(address indexed from, address indexed to, uint256 amount)'
    ])

const address = getAddress('0x8ba1f109551bd432803012645ac136ddd64dba72')

    const account = privateKeyToAccount('0x7656dea46927d34e85d4a4f75c11e5cd25e0aeba91829a2240125f0cf40ac22a')
    
    console.log("account: ", account.address);
    const client = createWalletClient({
      account,
      chain: scrollSepolia,
      transport: http()
    })

   const res = await client.chain
   console.log("res: ", res);
  });


  it("createTestClient", async () => {
    const client = createTestClient({
      chain: scrollSepolia,
      mode: 'anvil',
      transport: http(), 
    })
  });

});
