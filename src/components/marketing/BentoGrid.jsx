import { useRef } from 'react'
import { StaggerGroup, StaggerItem, fadeInUp } from '../../lib/motion'

/**
 * Bento layout. Cells span via colSpan/rowSpan props.
 * Hover spotlight follows the pointer via CSS custom properties.
 */
export function BentoGrid({ children, className = '' }) {
  return (
    <StaggerGroup
      delay={0.08}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${className}`}
    >
      {children}
    </StaggerGroup>
  )
}

export function BentoCell({ children, colSpan = 1, rowSpan = 1, className = '' }) {
  const ref = useRef(null)

  const handleMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  const spans = [
    colSpan === 2 ? 'sm:col-span-2' : '',
    colSpan === 3 ? 'sm:col-span-2 lg:col-span-3' : '',
    rowSpan === 2 ? 'lg:row-span-2' : '',
  ].join(' ')

  return (
    <StaggerItem variants={fadeInUp} className={`${spans} ${className}`}>
      <div
        ref={ref}
        onPointerMove={handleMove}
        className="bento-cell group h-full"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124, 58, 237, 0.08), transparent 60%)',
          }}
        />
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </StaggerItem>
  )
}
