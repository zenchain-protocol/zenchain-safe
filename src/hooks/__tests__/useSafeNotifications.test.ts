import { renderHook } from '@/tests//test-utils'
import useSafeNotifications from '../../hooks/useSafeNotifications'
import useSafeInfo from '../../hooks/useSafeInfo'
import { showNotification } from '@/store/notificationsSlice'

// mock showNotification
jest.mock('@/store/notificationsSlice', () => {
  const original = jest.requireActual('@/store/notificationsSlice')
  return {
    ...original,
    showNotification: jest.fn(original.showNotification),
  }
})

// mock useSafeInfo
jest.mock('../../hooks/useSafeInfo')

// mock useIsSafeOwner
jest.mock('../../hooks/useIsSafeOwner', () => ({
  __esModule: true,
  default: jest.fn(() => true),
}))

// mock router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: { safe: 'eth:0x123' },
  })),
}))

describe('useSafeNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Safe upgrade', () => {
    it('should show a notification when the Safe version is out of date', () => {
      // mock useSafeInfo to return a SafeInfo with an outdated version
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x123' },
          implementationVersionState: 'OUTDATED',
          version: '1.1.1',
          address: {
            value: '0x1',
          },
          chainId: '5',
        },
        safeAddress: '0x123',
      })

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).toHaveBeenCalledWith({
        variant: 'warning',
        message: `Your Safe Account version 1.1.1 is out of date. Please update it using Safe{Wallet}.`,
        groupKey: 'safe-outdated-version',
        link: {
          href: 'https://app.safe.global',
          title: 'Safe{Wallet}',
        },
        onClose: expect.anything(),
      })
    })

    it('should show a notification for legacy Safes', () => {
      // mock useSafeInfo to return a SafeInfo with an outdated version
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x123' },
          implementationVersionState: 'OUTDATED',
          version: '0.0.1',
          address: {
            value: '0x1',
          },
          chainId: '5',
        },
        safeAddress: '0x123',
      })

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).toHaveBeenCalledWith({
        variant: 'warning',
        message: `Safe Account version 0.0.1 is not supported by Eternal Safe. You can update your Safe Account in Safe{Wallet}.`,
        groupKey: 'safe-outdated-version',
        link: {
          href: 'https://app.safe.global',
          title: 'Safe{Wallet}',
        },
        onClose: expect.anything(),
      })
    })

    it('should not show a notification when the Safe version is up to date', () => {
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x123' },
          implementationVersionState: 'UP_TO_DATE',
          version: '1.3.0',
          address: {
            value: '0x1',
          },
          chainId: '5',
        },
      })

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).not.toHaveBeenCalled()
    })
  })

  describe('Invalid mastercopy', () => {
    it('should show a notification when the mastercopy is invalid', () => {
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x123' },
          implementationVersionState: 'UNKNOWN',
          version: '1.3.0',
          address: {
            value: '0x1',
          },
          chainId: '5',
        },
      })

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).toHaveBeenCalledWith({
        variant: 'warning',
        message: `This Safe Account was created with an unsupported base contract.
            Zenchain Safe may not work correctly, proceed at your own risk.`,
        groupKey: 'invalid-mastercopy',
        link: {
          href: 'https://github.com/eternalsafe/wallet/releases/latest',
          title: 'Check for Zenchain Safe updates',
        },
      })
    })
    it('should not show a notification when the mastercopy is valid', async () => {
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x456' },
          implementationVersionState: 'UP_TO_DATE',
          version: '1.3.0',
          address: {
            value: '0x1',
          },
          chainId: '5',
        },
      })

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).not.toHaveBeenCalled()
    })
  })
})
