import { useEffect, useRef, useState } from 'react'
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

// ============ Variants ============

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
}

export const staggerContainer = (delay = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
})

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
}

export const springHover = {
  whileHover: { scale: 1.03, y: -4 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
}

export const viewportOnce = { once: true, margin: '-80px' }

export const blurInUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export const clipReveal = {
  hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 },
  show: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
  },
}

export const pageTransitionPro = {
  initial: { opacity: 0, y: 10, scale: 0.995, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, scale: 0.995, filter: 'blur(4px)' },
  transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
}

// ============ Wrapper Components ============

export function Reveal({ children, variants = fadeInUp, className, ...props }) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerGroup({ children, delay = 0.08, className, ...props }) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer(delay)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, variants = fadeInUp, className, ...props }) {
  return (
    <motion.div className={className} variants={variants} {...props}>
      {children}
    </motion.div>
  )
}

// ============ Interactive Components ============

const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/**
 * Animated number counter. Writes to textContent directly — no re-renders.
 * Reduced motion => renders final value immediately.
 */
export function CountUp({ to, prefix = '', suffix = '', duration = 1.6, decimals = 0, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!inView || !ref.current) return
    const format = (v) => `${prefix}${v.toFixed(decimals)}${suffix}`
    if (reduced) {
      ref.current.textContent = format(to)
      return
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v)
      },
    })
    return () => controls.stop()
  }, [inView, to, prefix, suffix, duration, decimals, reduced])

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}

/**
 * Magnetic hover — children drift toward cursor (max ±8px).
 * Disabled on coarse pointers and reduced motion.
 */
export function Magnetic({ children, strength = 8, className }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const disabled = reduced || isCoarsePointer()

  const handleMove = (e) => {
    if (disabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    x.set(Math.max(-strength, Math.min(strength, dx * 0.2)))
    y.set(Math.max(-strength, Math.min(strength, dy * 0.2)))
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={disabled ? undefined : { x: springX, y: springY }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scroll parallax wrapper. speed 0.1–0.5 sensible. Reduced motion => static.
 */
export function Parallax({ children, speed = 0.2, className }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [80 * speed, -80 * speed])

  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { y }}>
      {children}
    </motion.div>
  )
}

/**
 * Infinite marquee — CSS animation (cheap, respects global reduced-motion CSS kill).
 * Children duplicated for seamless loop.
 */
export function Marquee({ children, reverse = false, pauseOnHover = true, className = '' }) {
  return (
    <div className={`overflow-hidden marquee-mask ${className}`}>
      <div
        className={`flex w-max gap-8 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        }`}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Pointer-tracked 3D tilt (max 4deg). Disabled coarse-pointer / reduced motion.
 */
export function TiltCard({ children, maxTilt = 4, className }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const springRx = useSpring(rx, { stiffness: 200, damping: 20 })
  const springRy = useSpring(ry, { stiffness: 200, damping: 20 })

  const disabled = reduced || isCoarsePointer()

  const handleMove = (e) => {
    if (disabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * maxTilt * 2)
    rx.set(-py * maxTilt * 2)
  }

  const handleLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        disabled
          ? undefined
          : { rotateX: springRx, rotateY: springRy, transformPerspective: 900 }
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  )
}

/**
 * Splits text into per-word animated spans (blurInUp stagger). For hero headlines.
 */
export function SplitWords({ text, className, wordClassName, delay = 0.03 }) {
  const words = String(text).split(' ')
  return (
    <motion.span
      className={className}
      variants={staggerContainer(delay)}
      initial="hidden"
      animate="show"
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="whitespace-pre" aria-hidden="true"><motion.span variants={blurInUp} className={`inline-block ${wordClassName || ''}`}>{word}</motion.span>{i < words.length - 1 ? ' ' : ''}</span>
      ))}
    </motion.span>
  )
}

/**
 * Simple hook: true after first client render — for SSR-safe pointer checks.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
