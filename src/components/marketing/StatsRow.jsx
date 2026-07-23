import { CountUp, StaggerGroup, StaggerItem, fadeInUp } from '../../lib/motion'

/**
 * Row of animated stats with dividers.
 * stats: [{ value: 2000, suffix: '+', label: 'Active learners', decimals? }]
 */
export default function StatsRow({ stats = [], className = '' }) {
  return (
    <StaggerGroup
      delay={0.1}
      className={`grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-line/10 ${className}`}
    >
      {stats.map((stat) => (
        <StaggerItem
          key={stat.label}
          variants={fadeInUp}
          className="flex flex-col items-center text-center px-4"
        >
          <span className="font-display text-3xl sm:text-4xl font-bold gradient-text">
            <CountUp
              to={stat.value}
              prefix={stat.prefix || ''}
              suffix={stat.suffix || ''}
              decimals={stat.decimals || 0}
            />
          </span>
          <span className="mt-1 text-sm text-content-muted">{stat.label}</span>
        </StaggerItem>
      ))}
    </StaggerGroup>
  )
}
