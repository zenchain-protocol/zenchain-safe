import type { ReactElement } from 'react'

import { SidebarList } from '@/components/sidebar/SidebarList'
import { ListItem } from '@mui/material'
import DebugToggle from '../DebugToggle'
import { IS_PRODUCTION } from '@/config/constants'

const SidebarFooter = (): ReactElement => {
  return (
    <SidebarList>
      {!IS_PRODUCTION && (
        <ListItem disablePadding>
          <DebugToggle />
        </ListItem>
      )}
    </SidebarList>
  )
}

export default SidebarFooter
