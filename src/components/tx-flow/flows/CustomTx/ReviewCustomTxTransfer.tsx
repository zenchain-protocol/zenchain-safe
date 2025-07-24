import { useContext, useEffect } from 'react'
import SignOrExecuteForm, { type SubmitCallback } from '@/components/tx/SignOrExecuteForm'
import SendToBlock from '@/components/tx/SendToBlock'
import { createTx } from '@/services/tx/tx-sender'
import { Interface } from '@ethersproject/abi'
import type { CustomTxParams } from '.'
import { SafeTxContext } from '../../SafeTxProvider'
import { type MetaTransactionData } from '@safe-global/safe-core-sdk-types'

const ReviewCustomTxTransfer = ({
  params,
  onSubmit,
  txNonce,
}: {
  params: CustomTxParams
  onSubmit: SubmitCallback
  txNonce?: number
}) => {
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)

  useEffect(() => {
    if (txNonce !== undefined) {
      setNonce(txNonce)
    }

    console.log('params:', params)

    const contractInterface = new Interface(params.abi)

    console.log('contractInterface:', contractInterface)

    const functionParams = []

    for (const paramName in params.functionInputs) {
      const value = params.functionInputs[paramName]

      functionParams.push(value)
    }

    console.log('functionParams:', functionParams)

    const txParams: MetaTransactionData = {
      to: params.contractAddress,
      value: '0',
      data: contractInterface.encodeFunctionData(params.contractFunction, functionParams),
    }

    console.log('txParams:', txParams)

    createTx(txParams, txNonce).then(setSafeTx).catch(setSafeTxError)
  }, [params, txNonce, setNonce, setSafeTx, setSafeTxError])

  return (
    <SignOrExecuteForm onSubmit={onSubmit}>
      <SendToBlock address={params.contractAddress} />
    </SignOrExecuteForm>
  )
}

export default ReviewCustomTxTransfer
