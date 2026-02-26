'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'color-mix(in oklch, var(--popover) 80%, transparent)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'color-mix(in oklch, var(--border) 85%, white 12%)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
