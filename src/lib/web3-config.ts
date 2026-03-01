import { http, createConfig } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// Define localhost chain with proper configuration
export const localhostChain = {
  ...localhost,
  id: 1337,
  name: 'Localhost',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
}

// Wagmi configuration - Localhost ONLY to prevent any external RPC calls
export const config = createConfig({
  chains: [localhostChain],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    metaMask(),
  ],
  transports: {
    [localhostChain.id]: http('http://127.0.0.1:8545'),
  },
  ssr: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
