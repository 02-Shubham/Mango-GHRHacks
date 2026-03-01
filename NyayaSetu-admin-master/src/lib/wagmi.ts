import { http, createConfig } from 'wagmi'
import { mainnet, localhost, hardhat } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
    chains: [mainnet, localhost, hardhat],
    connectors: [
        injected(),
    ],
    transports: {
        [mainnet.id]: http(),
        [localhost.id]: http(),
        [hardhat.id]: http(),
    },
})
