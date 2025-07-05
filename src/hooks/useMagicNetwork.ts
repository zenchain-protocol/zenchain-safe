import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppDispatch } from '@/store'
import { setRpc } from '@/store/settingsSlice'
import { addChain, type ChainInfo } from '@/store/customChainsSlice'
import { type RPC_AUTHENTICATION } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import useChains from './useChains'
import { showNotification } from '@/store/notificationsSlice'
import { useRouter } from 'next/router'

export const useMagicNetwork = (): void => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const supportedChains = useChains()

  useEffect(() => {
    // Get params
    const chainIdParam = process.env.NEXT_PUBLIC_CONFIG_CHAIN_ID!
    const chainName = process.env.NEXT_PUBLIC_CONFIG_CHAIN_NAME!
    const rpcUrl = process.env.NEXT_PUBLIC_CONFIG_CHAIN_RPC!
    const shortName = process.env.NEXT_PUBLIC_CONFIG_CHAIN_SHORT_NAME!
    const currencyName = process.env.NEXT_PUBLIC_CONFIG_CURRENCY!
    const currencySymbol = process.env.NEXT_PUBLIC_CONFIG_SYMBOL!
    const currencyLogo = searchParams.get('logo')
    const explorerAddr = process.env.NEXT_PUBLIC_CONFIG_EXPR_ADDR!
    const explorerTx = process.env.NEXT_PUBLIC_CONFIG_EXPR_TX!
    const l2 = searchParams.get('l2')
    const isTestnet = process.env.NEXT_PUBLIC_CONFIG_TESTNET

    // Return if no RPC param, chainId or chainName
    if (!rpcUrl || !chainIdParam || !chainName) return

    // Check if chain already exists in supported chains
    const existingChain = supportedChains.configs.find((chain) => chain.chainId === chainIdParam)

    if (!existingChain) {
      // Return if no currency info
      if (!currencyName || !currencySymbol || !shortName) {
        const missingParams = [
          !currencyName ? 'currency' : '',
          !currencySymbol ? 'symbol' : '',
          !shortName ? 'shortName' : '',
          !chainName ? 'chain' : '',
        ]
          .filter(Boolean)
          .join(', ')
        dispatch(
          showNotification({
            message: `Missing required network params: ${missingParams}`,
            groupKey: 'missing-network-params',
            variant: 'error',
          }),
        )
        return
      }

      // Create a new chain configuration
      const newChain = {
        custom: true,
        chainId: chainIdParam,
        chainName,
        shortName,
        description: '',
        chainLogoUri: currencyLogo || null,
        l2: l2 === 'true',
        isTestnet: isTestnet === 'true',
        nativeCurrency: {
          name: currencyName,
          symbol: currencySymbol,
          decimals: 18,
          logoUri: currencyLogo || '',
        },
        blockExplorerUriTemplate: {
          address: explorerAddr || 'https://example.com/address/{{address}}',
          txHash: explorerTx || 'https://example.com/tx/{{txHash}}',
          api: '',
        },
        features: [],
        disabledWallets: [],
        theme: {
          textColor: '#001428',
          backgroundColor: '#DDDDDD',
        },
        publicRpcUri: {
          authentication: 'NO_AUTH' as RPC_AUTHENTICATION,
          value: rpcUrl,
        },
        rpcUri: {
          authentication: 'NO_AUTH' as RPC_AUTHENTICATION,
          value: rpcUrl,
        },
        safeAppsRpcUri: {
          authentication: 'NO_AUTH' as RPC_AUTHENTICATION,
          value: rpcUrl,
        },
        transactionService: '',
        gasPrice: [],
      } as ChainInfo

      // Add the chain to Redux store
      dispatch(addChain(newChain))
    }

    // Store RPC URL in settings
    dispatch(
      setRpc({
        chainId: chainIdParam,
        rpc: rpcUrl,
      }),
    )

    //router.replace({ query: { chain: shortName } })
  }, [searchParams, dispatch, chainId, supportedChains, router])
}

export default useMagicNetwork
