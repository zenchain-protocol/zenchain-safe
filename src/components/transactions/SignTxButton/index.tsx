import { useCallback, useContext, useEffect, useState, type ReactElement, type SyntheticEvent } from 'react'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Button, Tooltip } from '@mui/material'

import { isSignableBy, type TransactionDetails } from '@/utils/transaction-guards'
import useWallet from '@/hooks/wallets/useWallet'
import useIsPending from '@/hooks/useIsPending'
import IconButton from '@mui/material/IconButton'
import CheckIcon from '@mui/icons-material/Check'
import ShareIcon from '@mui/icons-material/Share'
import CheckWallet from '@/components/common/CheckWallet'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { getTxButtonTooltip } from '@/components/transactions/utils'
import { TxModalContext } from '@/components/tx-flow'
import { ConfirmTxFlow } from '@/components/tx-flow/flows'
import { useShareMagicLink } from '@/hooks/useMagicLink'
import { useSafeTransactionFromDetails } from '@/hooks/useConvertTx'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { OnboardingTooltip } from '@/components/common/OnboardingTooltip'

const LS_MAGICLINK_ONBOARDING = 'magiclink_onboarding'
const INITIAL_TOOLTIP_TEXT = 'Copy Smart Link'

const SignTxButton = ({
  txSummary,
  txDetails,
  compact = false,
}: {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
  compact?: boolean
}): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)
  const wallet = useWallet()
  const isSignable = isSignableBy(txSummary, wallet?.address || '')
  const isPending = useIsPending(txSummary.id)
  const safeSDK = useSafeSDK()

  const safeTx = useSafeTransactionFromDetails(txDetails)
  const tx = useShareMagicLink(safeTx)

  const router = useRouter()
  const { safe } = router.query
  const [link, setLink] = useState<string | undefined>(undefined)

  const showMagicLink = !isSignable || isPending || !safeSDK

  useEffect(() => {
    if (tx && safe && showMagicLink) {
      setLink(`${AppRoutes.transactions.tx}/?safe=${safe}&tx=${tx}`)
    } else {
      setLink(undefined)
    }
  }, [tx, router.query, showMagicLink, safe])

  const confirmTooltipTitle = getTxButtonTooltip('Confirm', { hasSafeSDK: !!safeSDK })

  const [magicTooltipText, setMagicTooltipText] = useState(INITIAL_TOOLTIP_TEXT)
  const [showMagicTooltip, setShowMagicTooltip] = useState(false)
  const [isCopyEnabled, setIsCopyEnabled] = useState(true)

  const onClick = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (link) {
        let timeout: NodeJS.Timeout | undefined

        try {
          const fullLink = location.origin + link

          const message = `Please sign this Zenchain Safe transaction for the Safe: ${safe}. 
Current confirmations: ${txDetails.detailedExecutionInfo.confirmations.length} of ${txDetails.detailedExecutionInfo.confirmationsRequired}.

${fullLink}
`

          navigator.clipboard.writeText(message).then(() => setMagicTooltipText('Copied'))
          setShowMagicTooltip(true)
          timeout = setTimeout(() => {
            if (isCopyEnabled) {
              setShowMagicTooltip(false)
              setMagicTooltipText(INITIAL_TOOLTIP_TEXT)
            }
          }, 1000)
        } catch (err) {
          setIsCopyEnabled(false)
          setMagicTooltipText('Copying is disabled in your browser')
        }
      } else {
        setTxFlow(<ConfirmTxFlow txSummary={txSummary} txDetails={txDetails} />, undefined, false)
      }
    },
    [link, txDetails, setTxFlow, txSummary, isCopyEnabled, safe],
  )

  return showMagicLink ? (
    <span>
      {compact ? (
        <Tooltip
          title={magicTooltipText}
          arrow
          placement="top"
          open={showMagicTooltip}
          onOpen={() => setShowMagicTooltip(true)}
          onClose={() => setShowMagicTooltip(false)}
        >
          <span>
            <IconButton onClick={onClick} color="primary" disabled={!link} size="small">
              <ShareIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <OnboardingTooltip
          widgetLocalStorageId={LS_MAGICLINK_ONBOARDING}
          placement="top"
          text={
            <>
              Zenchain Safe relies on smart links to share transaction details.
              <br />
              These links are unique to each transaction and should be shared with other signers in order to collect
              signatures and share full transaction details.
            </>
          }
          postText={magicTooltipText}
          open={showMagicTooltip}
          onOpen={() => setShowMagicTooltip(true)}
          onClose={() => setShowMagicTooltip(false)}
        >
          <Button sx={{ whiteSpace: 'nowrap' }} onClick={onClick} variant="contained" disabled={!link} size="stretched">
            Smart Link
          </Button>
        </OnboardingTooltip>
      )}
    </span>
  ) : (
    <CheckWallet>
      {(isOk) =>
        compact ? (
          <Tooltip title={confirmTooltipTitle} arrow placement="top">
            <span>
              <IconButton onClick={onClick} color="primary" disabled={!isOk} size="small">
                <CheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Button onClick={onClick} variant="contained" disabled={!isOk} size="stretched">
            Confirm
          </Button>
        )
      }
    </CheckWallet>
  )
}

export default SignTxButton
