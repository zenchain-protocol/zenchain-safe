import { type ReactElement, useContext, useEffect, useMemo } from 'react'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import {
  Button,
  CardActions,
  Divider,
  FormControl,
  Grid,
  Typography,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import TokenIcon from '@/components/common/TokenIcon'
import AddressBookInput from '@/components/common/AddressBookInput'
import TxCard from '../../common/TxCard'
import { formatVisualAmount } from '@/utils/formatters'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { CustomTxFields, type CustomTxParams } from '.'

export const AutocompleteItem = (item: { tokenInfo: TokenInfo; balance: string }): ReactElement => (
  <Grid container alignItems="center" gap={1}>
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Grid item xs>
      <Typography variant="body2">{item.tokenInfo.name}</Typography>

      <Typography variant="caption" component="p">
        {formatVisualAmount(item.balance, item.tokenInfo.decimals)} {item.tokenInfo.symbol}
      </Typography>
    </Grid>
  </Grid>
)

type AbiEntry = {
  type: string
  name?: string
  stateMutability?: string
  inputs?: { name: string; type: string }[]
}

export const CreateCustomTxTransfer = ({
  params,
  onSubmit,
  txNonce,
}: {
  params: CustomTxParams
  onSubmit: (data: CustomTxParams) => void
  txNonce?: number
}): ReactElement => {
  const { setNonce, setNonceNeeded } = useContext(SafeTxContext)

  useEffect(() => {
    if (txNonce) {
      setNonce(txNonce)
    }
  }, [setNonce, txNonce])

  const formMethods = useForm<CustomTxParams>({
    defaultValues: {
      ...params,
    },
    mode: 'onChange',
    delayError: 500,
  })

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = formMethods

  const destination = watch(CustomTxFields.contractAddress)
  const abi = watch(CustomTxFields.abi)
  const data = watch(CustomTxFields.data)

  const isAddressValid = !!destination && !errors[CustomTxFields.contractAddress]

  const abiEntries = useMemo<AbiEntry[]>(() => {
    try {
      return JSON.parse(abi || '[]') as AbiEntry[]
    } catch {
      return []
    }
  }, [abi])

  const functionsList = useMemo(
    () =>
      abiEntries
        .filter(
          (e) =>
            e.type === 'function' && (e.stateMutability === 'nonpayable' || e.stateMutability === 'payable') && e.name,
        )
        .map((e) => e.name!),
    [abiEntries],
  )

  const selectedFunctionName = watch('contractFunction')

  const selectedABIFunctionEntry = useMemo(
    () => abiEntries.find((e) => e.name === selectedFunctionName),
    [abiEntries, selectedFunctionName],
  )

  useEffect(() => {
    if (selectedABIFunctionEntry) {
      console.log('changed selected ABI entry')

      formMethods.unregister(CustomTxFields.functionInputs)
    }
  }, [selectedABIFunctionEntry, formMethods])

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className={commonCss.form}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <AddressBookInput name={CustomTxFields.contractAddress} label="Contract address" canAdd={isAddressValid} />
          </FormControl>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <Controller
              name="abi"
              control={formMethods.control}
              defaultValue={undefined}
              rules={{
                required: 'ABI is required',
                validate: (value: string) => {
                  try {
                    JSON.parse(value)

                    return true
                  } catch {
                    return 'ABI must be valid JSON'
                  }
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="ABI"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </FormControl>

          {functionsList.length > 0 && (
            <Controller
              name="contractFunction"
              control={formMethods.control}
              defaultValue={undefined}
              rules={{ required: 'Pick a function to call' }}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mt: 1 }}>
                  <InputLabel id="fn-select-label">Contract function</InputLabel>

                  <Select
                    labelId="fn-select-label"
                    label="Contract function"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {functionsList.map((fn) => (
                      <MenuItem key={fn} value={fn}>
                        {fn}
                      </MenuItem>
                    ))}
                  </Select>

                  <FormHelperText>{error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          )}

          {selectedABIFunctionEntry &&
            selectedABIFunctionEntry!.inputs?.map((param, idx) => {
              const fieldName = param.name || `arg${idx}`

              return (
                <FormControl
                  fullWidth
                  sx={{ mt: 1 }}
                  key={fieldName}
                  error={!!(errors.functionInputs as Record<string, any>)?.[fieldName]}
                >
                  <TextField
                    error={!!(errors.functionInputs as Record<string, any>)?.[fieldName]}
                    {...formMethods.register(`functionInputs.${fieldName}` as any, {
                      required: `${fieldName} is required`,
                    })}
                    label={`${fieldName} (${param.type})`}
                    variant="outlined"
                    fullWidth
                  />
                  <FormHelperText>
                    {(errors.functionInputs as Record<string, any>)?.[fieldName]?.message as string}
                  </FormHelperText>
                </FormControl>
              )
            })}

          <Divider className={commonCss.nestedDivider} />

          <CardActions>
            <Button variant="contained" type="submit">
              Next
            </Button>
          </CardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}

export default CreateCustomTxTransfer
