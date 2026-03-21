import type { Variants, Transition } from 'framer-motion'

// ── Shared Transitions ────────────────────────────────────────────────────────
export const springTrans: Transition = {
  type: 'spring', stiffness: 360, damping: 28, mass: 0.8,
}
export const smoothTrans: Transition = {
  type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.3,
}
export const chartTrans: Transition = {
  type: 'tween', ease: [0.0, 0, 0.2, 1], duration: 0.65, delay: 0.15,
}

// ── Page Transition ───────────────────────────────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14, filter: 'blur(2px)' },
  animate: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: {
      duration: 0.35, ease: [0.4, 0, 0.2, 1],
      when: 'beforeChildren', staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0, y: -8,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
}

// ── Card Reveal ───────────────────────────────────────────────────────────────
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 26, mass: 0.8 },
  },
  exit: {
    opacity: 0, y: 10, scale: 0.97,
    transition: { duration: 0.15 },
  },
}

// ── Stagger Container ─────────────────────────────────────────────────────────
export const staggerVariants: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
}

// ── Chart Reveal ──────────────────────────────────────────────────────────────
export const chartVariants: Variants = {
  initial: { opacity: 0, scaleY: 0.94, transformOrigin: 'bottom center' },
  animate: {
    opacity: 1, scaleY: 1,
    transition: { ...chartTrans },
  },
}

// ── Number Flash (value changed) ──────────────────────────────────────────────
export const numberFlashVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.0, 0, 0.2, 1] },
  },
}

// ── Overlay Slide In (JeremyOverlay panel) ────────────────────────────────────
export const overlayVariants: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0, opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 0.9 },
  },
  exit: {
    x: '100%', opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
}

// ── Slide In From Left ────────────────────────────────────────────────────────
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1, x: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
}

// ── Slide In From Right ───────────────────────────────────────────────────────
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1, x: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
}

// ── Timeline Phase Reveal ─────────────────────────────────────────────────────
export const timelineVariants: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: {
    opacity: 1, x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
}

// ── Fade In ───────────────────────────────────────────────────────────────────
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// ── Scale In (badges, chips) ──────────────────────────────────────────────────
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 28 },
  },
}

// ── Progress Ring Transition ──────────────────────────────────────────────────
export const ringTrans: Transition = {
  type: 'tween', ease: [0.0, 0, 0.2, 1], duration: 1.1, delay: 0.3,
}
