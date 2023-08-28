import { createPublicClient, http, Chain } from "viem";
import { arbitrum, base, bsc, mainnet, polygonZkEvm, scrollSepolia, scrollTestnet, zkSync } from "viem/chains";



export const Scroll_Test = {
  id: 534351,
  name: 'Scroll Testnet',
  network: 'scroll-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://alpha-rpc.scroll.io/l2"'],
      webSocket: ['wss://alpha-rpc.scroll.io/l2/ws'],
    },
    public: {
      http: ['https://alpha-rpc.scroll.io/l2'],
      webSocket: ['wss://alpha-rpc.scroll.io/l2/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.scroll.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 42,
    },
  },
  testnet: true,
} as const satisfies Chain


export const publicClients = {
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http("https://eth.llamarpc.com"),
  }),
  [bsc.id]: createPublicClient({
    chain: bsc,
    transport: http("https://nodes.pancakeswap.info"),
  }),
  [polygonZkEvm.id]: createPublicClient({
    chain: polygonZkEvm,
    transport: http(),
  }),
  [zkSync.id]: createPublicClient({
    chain: zkSync,
    transport: http(),
  }),
  [arbitrum.id]: createPublicClient({
    chain: arbitrum,
    transport: http(),
  }),
  [Scroll_Test.id]: createPublicClient({
    chain: Scroll_Test,
    transport: http(),
  }),
  [scrollSepolia.id]: createPublicClient({
    chain: scrollSepolia,
    transport: http(),
  }),
  [base.id]: createPublicClient({
    chain: base,
    transport: http(),
  }),
};

