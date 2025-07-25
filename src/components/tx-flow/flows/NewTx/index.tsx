import { useCallback, useContext } from 'react'
import { CustomTxButton, SendNFTsButton, SendTokensButton } from '@/components/tx-flow/common/TxButton'
import { Container, Grid, Paper, SvgIcon, Typography } from '@mui/material'
import { TxModalContext } from '../../'
import TokenTransferFlow from '../TokenTransfer'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import AppsIcon from '@/public/images/apps/apps-icon.svg'
import { ProgressBar } from '@/components/common/ProgressBar'
import ChainIndicator from '@/components/common/ChainIndicator'
import NewTxIcon from '@/public/images/transactions/new-tx.svg'

import css from './styles.module.css'
import CustomTxFlow from '../CustomTx'

const NewTxFlow = () => {
  const { setTxFlow } = useContext(TxModalContext)

  const onTokensClick = useCallback(() => {
    setTxFlow(<TokenTransferFlow />)
  }, [setTxFlow])

  const onCustomTxClick = useCallback(() => {
    setTxFlow(<CustomTxFlow />)
  }, [setTxFlow])

  const progress = 10

  return (
    <Container className={css.container}>
      <Grid container justifyContent="center">
        {/* Alignment of `TxLayout` */}
        <Grid item xs={12} md={11} display="flex" flexDirection="column">
          <ChainIndicator inline className={css.chain} />

          <Grid container component={Paper}>
            <Grid item xs={12} className={css.progressBar}>
              <ProgressBar value={progress} />
            </Grid>
            <Grid item xs={12} md={6} className={css.pane} gap={3}>
              <div className={css.globs}>
                <NewTxIcon />
              </div>

              <Typography variant="h1" className={css.title}>
                New transaction
              </Typography>
            </Grid>

            <Grid item xs={12} md={5} className={css.pane} gap={2}>
              <div>
                <Typography variant="h4" className={css.type}>
                  <SvgIcon component={AssetsIcon} inheritViewBox color="secondary" />
                  Assets
                </Typography>

                <SendTokensButton onClick={onTokensClick} sx={{ mt: 3 }} />

                <SendNFTsButton sx={{ mt: 2 }} />
              </div>

              <div>
                <Typography variant="h4" className={css.type}>
                  <SvgIcon component={AppsIcon} inheritViewBox color="secondary" />
                  Smart contracts
                </Typography>

                <CustomTxButton onClick={onCustomTxClick} sx={{ mt: 2 }} />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

export default NewTxFlow
