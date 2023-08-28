import { getContract } from "viem";
import { erc20ABI } from "../src/utils/abi/erc20";
import { publicClients } from "../src/utils/publicClients";

describe("contract", () => {
  it("getContract", async () => {
    const publicClient = publicClients[534351];

    const contract = getContract({
      address: "0x3d38d54CbD0F6d90Cc3f861cd05e7F5d223Fb9Fe",
      abi: erc20ABI,
      publicClient,
    });

    const result = await contract.read.name();
    console.log("result: ", result);
  });
});
