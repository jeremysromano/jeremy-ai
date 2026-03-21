'use client'

import { motion } from 'framer-motion'
import { pageVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface PageShellProps {
  children: React.ReactNode
  className?: string
  advisor?: boolean
}

export function PageShell({ children, className, advisor = false }: PageShellProps) {
  return (
    <div
      className={cn('min-h-screen pt-14', advisor ? 'bg-[#F5F2EE]' : 'bg-[#EEF2FF]')}
      data-theme={advisor ? 'advisor' : undefined}
    >
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn('max-w-screen-2xl mx-auto px-6 py-10', className)}
      >
        {children}
      </motion.div>
    </div>
  )
}
