import { StaggerGroup, StaggerItem, blurInUp } from '../../lib/motion'

/**
 * Standard marketing section header: kicker label + gradient headline + subcopy.
 * Centered by default; pass align="left" for left-aligned sections.
 */
export default function SectionHeading({
  label,
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  const alignment =
    align === 'left' ? 'text-left items-start' : 'text-center items-center mx-auto'

  return (
    <StaggerGroup
      className={`flex flex-col ${alignment} max-w-2xl gap-4 ${className}`}
      delay={0.1}
    >
      {label && (
        <StaggerItem variants={blurInUp}>
          <span className="section-label">{label}</span>
        </StaggerItem>
      )}
      {title && (
        <StaggerItem variants={blurInUp}>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-content">
            {title}
          </h2>
        </StaggerItem>
      )}
      {subtitle && (
        <StaggerItem variants={blurInUp}>
          <p className="text-base sm:text-lg text-content-secondary leading-relaxed">
            {subtitle}
          </p>
        </StaggerItem>
      )}
    </StaggerGroup>
  )
}
