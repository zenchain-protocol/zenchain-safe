import { type ReactElement, useContext, useEffect, useMemo } from 'react'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { Controller, FormProvider, type RegisterOptions, useForm } from 'react-hook-form'
import { isAddress } from 'ethers/lib/utils'
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
  const { setNonce } = useContext(SafeTxContext)

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

  const getSolidityValidationRules = (type: string, label: string): RegisterOptions => {
    const base: RegisterOptions = { required: `${label} is required` }

    if (type === 'address') {
      return {
        ...base,
        validate: (v: string) => isAddress(v) || 'Must be a valid Ethereum address',
      }
    }

    if (/^u?int/.test(type)) {
      return {
        ...base,
        validate: (v: string) => !isNaN(Number(v)) || 'Must be a numeric value',
      }
    }

    if (type === 'bool') {
      return {
        ...base,
        validate: (v: string) => v === 'true' || v === 'false' || 'Must be true or false',
      }
    }

    if (type.startsWith('bytes')) {
      return {
        ...base,
        validate: (v: string) => /^0x[0-9a-fA-F]+$/.test(v) || 'Must be hex (0x…)',
      }
    }

    if (/^tuple(?:\[\])*$/i.test(type)) {
      return {
        ...base,
        validate: (v: string) => {
          try {
            const parsed = JSON.parse(v)

            if (type.endsWith('[]') && !Array.isArray(parsed)) {
              return 'Must be a JSON array of tuples'
            }
            return true
          } catch {
            return 'Must be valid JSON'
          }
        },
      }
    }

    return base
  }

  useEffect(() => {
    formMethods.resetField('contractFunction', { defaultValue: '' })

    formMethods.resetField('functionInputs', { defaultValue: {} })

    formMethods.resetField('value', { defaultValue: '' })
  }, [abi, formMethods])

  useEffect(() => {
    formMethods.resetField(CustomTxFields.contractFunction, { defaultValue: '' })
  }, [functionsList, formMethods])

  useEffect(() => {
    if (selectedABIFunctionEntry) {
      formMethods.resetField(CustomTxFields.value, { defaultValue: '' })

      formMethods.resetField(CustomTxFields.functionInputs, { defaultValue: [] })
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

          {selectedABIFunctionEntry && selectedABIFunctionEntry.stateMutability == 'payable' && (
            <FormControl fullWidth sx={{ mt: 1 }} error={!!errors.value}>
              <TextField
                error={!!errors.value}
                defaultValue={undefined}
                {...formMethods.register(`value`, getSolidityValidationRules('uint256', 'value'))}
                label={`value (uint256)`}
                variant="outlined"
                fullWidth
              />
              <FormHelperText>{errors.value?.message as string}</FormHelperText>
            </FormControl>
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
                    {...formMethods.register(
                      `functionInputs.${fieldName}` as any,
                      getSolidityValidationRules(param.type, fieldName),
                    )}
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
