import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import CreateCustomTxTransfer from './CreateCustomTxTransfer'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import ReviewCustomTxTransfer from './ReviewCustomTxTransfer'

enum Fields {
  contractAddress = 'contractAddress',
  abi = 'abi',
  data = 'data',
  contractFunction = 'contractFunction',
  functionInputs = 'functionInputs',
}

export const CustomTxFields = { ...Fields }

export type CustomTxParams = {
  [Fields.contractAddress]: string
  [Fields.abi]: string
  [Fields.data]: string
  [Fields.contractFunction]: string
  [Fields.functionInputs]: any[]
}

type TokenTransferFlowProps = Partial<CustomTxParams> & {
  txNonce?: number
}

const defaultParams: CustomTxParams = {
  contractAddress: '',
  abi: '',
  data: '',
  contractFunction: '',
  functionInputs: [],
}

const CustomTxFlow = ({ txNonce, ...params }: TokenTransferFlowProps) => {
  const { data, step, nextStep, prevStep } = useTxStepper<CustomTxParams>({
    ...defaultParams,
    ...params,
  })

  const steps = [
    <CreateCustomTxTransfer
      key={0}
      params={data}
      txNonce={txNonce}
      onSubmit={(formData) => nextStep({ ...data, ...formData })}
    />,

    <ReviewCustomTxTransfer key={1} params={data} txNonce={txNonce} onSubmit={() => null} />,
  ]

  return (
    <TxLayout
      title={step === 0 ? 'New transaction' : 'Confirm transaction'}
      subtitle="Custom transaction"
      icon={AssetsIcon}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default CustomTxFlow
