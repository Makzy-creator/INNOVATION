import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// 2. Create wagmiConfig
const metadata = {
  name: 'LIFEFLOW Blood Donation Platform',
  description: 'Blockchain-powered blood donation platform',
  url: 'https://lifeflow.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [polygon, polygonMumbai] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#dc2626',
    '--w3m-color-mix-strength': 40
  }
})

export { projectId }