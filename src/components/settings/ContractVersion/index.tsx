import { Box, SvgIcon, Typography, Alert, AlertTitle, Skeleton, Link } from '@mui/material'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import { LATEST_SAFE_VERSION, REPO_LATEST_RELEASE_URL } from '@/config/constants'
import useSafeInfo from '@/hooks/useSafeInfo'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@/public/images/notifications/info.svg'
import { isValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'

export const ContractVersion = () => {
  const { safe, safeLoaded } = useSafeInfo()

  const needsUpdate = safe.implementationVersionState === ImplementationVersionState.OUTDATED
  const unsupportedVersion = safe.version ? !isValidSafeVersion(safe.version) : true

  return (
    <>
      <Typography variant="h4" fontWeight={700} marginBottom={1}>
        Contract version
      </Typography>

      <Typography variant="body1" fontWeight={400}>
        {safeLoaded ? (
          unsupportedVersion ? (
            `Unsupported contract ${safe.version ? `(${safe.version})` : ''}`
          ) : (
            safe.version
          )
        ) : (
          <Skeleton width="60px" />
        )}
      </Typography>
      <Box mt={2}>
        {safeLoaded ? (
          needsUpdate ? (
            <Alert
              sx={{ borderRadius: '2px', borderColor: '#B0FFC9' }}
              icon={<SvgIcon component={InfoIcon} inheritViewBox color="secondary" />}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>
                This version of Zenchain Safe works best with Safe version {LATEST_SAFE_VERSION}.
              </AlertTitle>

              <Typography>
                Please use the official Safe{'{Wallet}'} app to update your Safe to {LATEST_SAFE_VERSION}.
              </Typography>
            </Alert>
          ) : unsupportedVersion ? (
            <Alert
              sx={{ borderRadius: '2px', borderColor: '#B0FFC9' }}
              icon={<SvgIcon component={InfoIcon} inheritViewBox color="secondary" />}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>
                This version of Zenchain Safe works best with {LATEST_SAFE_VERSION}.
              </AlertTitle>

              <Typography>
                You appear to be using an unsupported version of Safe, which may cause issues using Eternal Safe. You
                can continue to use it at your own risk or{' '}
                <Link href={REPO_LATEST_RELEASE_URL} target="_blank" rel="noreferrer">
                  check if there is a newer version of Eternal Safe
                </Link>
                .
              </Typography>
            </Alert>
          ) : (
            <Typography display="flex" alignItems="center">
              <CheckCircleIcon color="primary" sx={{ mr: 0.5 }} /> Latest version
            </Typography>
          )
        ) : null}
      </Box>
    </>
  )
}
