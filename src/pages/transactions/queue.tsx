import type { NextPage } from 'next'
import Head from 'next/head'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TxHeader from '@/components/transactions/TxHeader'
import { Box } from '@mui/material'

const Queue: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Zenchain Safe – Transaction queue'}</title>
      </Head>

      <TxHeader />

      <main>
        <Box mb={4}>
          {/* The main queue of signed transactions */}
          <PaginatedTxns useTxns={useTxQueue} />
        </Box>
      </main>
    </>
  )
}

export default Queue
