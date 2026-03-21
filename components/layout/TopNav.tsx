'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { JeremyLogo } from '@/components/shared/JeremyLogo'
import { Compass, TrendingUp, Key } from 'lucide-react'

// ── Agent modes — the three phases of homeownership ──────────────────────────

const MODES = [
  {
    id: 'find',
    label: 'Find',
    sublabel: 'Discover homes',
    icon: Compass,
    href: '/search',
    match: (p: string) => p === '/' || p === '/search',
    subLinks: [] as { href: string; label: string }[],
  },
  {
    id: 'finance',
    label: 'Finance',
    sublabel: 'Secure your mortgage',
    icon: TrendingUp,
    href: '/profile',
    match: (p: string) =>
      ['/profile', '/buying-power', '/scenarios', '/readiness', '/journey'].includes(p),
    subLinks: [
      { href: '/profile',       label: 'Profile' },
      { href: '/buying-power',  label: 'Buying Power' },
      { href: '/scenarios',     label: 'Scenarios' },
      { href: '/readiness',     label: 'Readiness' },
      { href: '/journey',       label: 'Journey' },
    ],
  },
  {
    id: 'own',
    label: 'Own',
    sublabel: 'Build your equity',
    icon: Key,
    href: '/homeowner',
    match: (p: string) => p === '/homeowner',
    subLinks: [] as { href: string; label: string }[],
  },
] as const

export function TopNav() {
  const pathname = usePathname()
  const isAdvisor = pathname === '/advisor'
  const activeMode = MODES.find(m => m.match(pathname))

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-14 flex items-center border-b backdrop-blur-md',
        isAdvisor
          ? 'bg-[#FAF8F5]/90 border-[#D6CFC7]'
          : 'bg-white/90 border-[#E2E8F0]'
      )}
      style={{ boxShadow: '0 1px 0 rgba(13,27,42,0.04)' }}
    >
      <div className="max-w-screen-2xl mx-auto w-full px-6 flex items-center gap-4">

        {/* Logo */}
        <Link href="/search" className="flex items-center shrink-0">
          <JeremyLogo size="sm" advisor={isAdvisor} />
        </Link>

        {/* ── Agent mode switcher (borrower only) ── */}
        {!isAdvisor && (
          <div
            className="flex items-center rounded-full p-[3px] gap-0.5 shrink-0"
            style={{ background: '#EEEEF2' }}
          >
            {MODES.map(mode => {
              const isActive = mode.match(pathname)
              const Icon = mode.icon
              return (
                <Link
                  key={mode.id}
                  href={mode.href}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3.5 py-[6px] rounded-full text-[13px] font-medium transition-all duration-150 select-none',
                    isActive
                      ? 'bg-white text-[#0D1B2A] shadow-[0_1px_3px_rgba(13,27,42,0.14)]'
                      : 'text-[#64748B] hover:text-[#0D1B2A] hover:bg-white/50'
                  )}
                >
                  <Icon size={13} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{mode.label}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Finance sub-links (contextual) ── */}
        {activeMode && activeMode.subLinks.length > 0 && (
          <div className="flex items-center gap-0.5 flex-1">
            <span className="w-px h-4 bg-[#E2E8F0] mr-2 shrink-0" />
            {activeMode.subLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-brand-600 text-white'
                    : 'text-[#64748B] hover:text-[#0D1B2A] hover:bg-[#F1F5F9]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Spacer when no sub-links */}
        {(!activeMode || activeMode.subLinks.length === 0) && !isAdvisor && (
          <div className="flex-1" />
        )}

        {/* ── Right: Advisor link + avatar ── */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/advisor"
            className={cn(
              'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors',
              isAdvisor
                ? 'bg-[#92700A] text-white'
                : 'text-[#64748B] hover:text-[#0D1B2A] hover:bg-[#F1F5F9]'
            )}
          >
            Advisor Cockpit
          </Link>
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
              isAdvisor ? 'bg-[#EDE9E4] text-[#44403C]' : 'bg-brand-100 text-brand-700'
            )}
          >
            JS
          </div>
        </div>

      </div>
    </nav>
  )
}
