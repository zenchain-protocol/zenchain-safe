import type { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'
import MUILink from '@mui/material/Link'

const footerPages = [AppRoutes.welcome.index, AppRoutes.settings.index, AppRoutes.imprint]

const FooterLink = ({ children, href }: { children: ReactNode; href: string }): ReactElement => {
  return href ? (
    <Link href={href} passHref legacyBehavior>
      <MUILink>{children}</MUILink>
    </Link>
  ) : (
    <MUILink>{children}</MUILink>
  )
}

const Footer = (): ReactElement | null => {
  const router = useRouter()

  if (!footerPages.some((path) => router.pathname.startsWith(path))) {
    return null
  }

  const getHref = (path: string): string => {
    return router.pathname === path ? '' : path
  }

  return (
    <footer className={css.container}>
      <ul>
        <li>
          <Typography variant="caption">Zenchain Safe</Typography>
        </li>
        <li>
          <FooterLink href={getHref(AppRoutes.settings.index)}>Preferences</FooterLink>
        </li>
      </ul>
    </footer>
  )
}

export default Footer
