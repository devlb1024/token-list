import 'isomorphic-fetch'
import { Hex, createTestClient, createWalletClient, fromHex, getAbiItem, getAddress, getContract, http, parseAbi } from "viem";
import { erc20ABI } from "../src/utils/abi/erc20";
import { publicClients } from "../src/utils/publicClients";
import { privateKeyToAccount } from 'viem/accounts'
import { foundry, scrollSepolia } from "viem/chains";
import { KuramaV3FactoryABI } from '../src/utils/abi/KuramaV3Factory';


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

  it("getAbi", async () => {
    const url = "https://sepolia-blockscout.scroll.io/api?module=contract&action=getabi&address=0x11377A6812ddB8BE9B664aCa05dC31d2F196E7f9"
    const res =  await fetch(url)
    const json =  await res.json()
    console.log("res: ", json);
    
  });

  it("KuramaV3FactoryABI", async () => {
    const publicClient = publicClients[534351];

    // const contract = getContract({
    //   address: "0x11377A6812ddB8BE9B664aCa05dC31d2F196E7f9",
    //   abi: KuramaV3FactoryABI,
    //   publicClient,
    // });

    // const pool = await contract.read.getPool([
    //  "0x3d38d54CbD0F6d90Cc3f861cd05e7F5d223Fb9Fe",
    //  "0x5C1fe01D69d2657455B6D4aE61500F2F42353e10" ,
    //   100
    // ])

  //  const res =  publicClient.watchContractEvent({
  //     address: '0x11377A6812ddB8BE9B664aCa05dC31d2F196E7f9',
  //     abi: KuramaV3FactoryABI,
  //     eventName: 'PoolCreated',
  //     onLogs: (logs) => {
  //       console.log("-logs--", logs)
  //     },
  //     onError: (error) => {
  //       console.log("-error--", error)
  //     }
  //   })

  
      const filter  =  await publicClient.createContractEventFilter({
        abi: KuramaV3FactoryABI,
        address: '0x11377A6812ddB8BE9B664aCa05dC31d2F196E7f9' ,
        eventName: 'PoolCreated' 
    })
        
    const logs = await publicClient.getFilterChanges({ filter })
      console.log("logs: ", logs);
       
  });


  it("createTestClient", async () => {
    const testClient = createTestClient({
      chain: foundry,
      mode: 'anvil',
      transport: http(), 
    })

    const impersonateAccount =  await testClient.impersonateAccount({ 
      address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'
    })
    console.log("impersonateAccount: ", impersonateAccount);
    


  });

});
