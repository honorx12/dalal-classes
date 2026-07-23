import { Crown } from 'lucide-react'

/**
 * Free/Pro pill. variant='pro' => gradient crown pill; 'free' => subtle badge.
 */
export default function PlanBadge({ plan = 'free', size = 'sm', className = '' }) {
  const isPro = plan === 'pro'
  const sizing = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  if (isPro) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-semibold text-white bg-gradient-vivid shadow-glow-brand ${sizing} ${className}`}
      >
        <Crown className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        Pro
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-content-secondary bg-surface/[0.06] border border-line/10 ${sizing} ${className}`}
    >
      Free
    </span>
  )
}
