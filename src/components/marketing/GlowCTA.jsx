import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Magnetic, Reveal, scaleIn } from '../../lib/motion'

/**
 * Full-width CTA band: animated-border card over mesh, magnetic primary button.
 */
export default function GlowCTA({
  title = 'Start learning free today',
  subtitle = 'No credit card. No catch. Upgrade to Pro whenever you are ready.',
  primaryLabel = 'Get started free',
  primaryTo = '/signup',
  secondaryLabel = 'View pricing',
  secondaryTo = '/pricing',
}) {
  return (
    <section className="section-container py-16 sm:py-24">
      <Reveal variants={scaleIn}>
        <div className="animated-border rounded-3xl">
          <div className="relative overflow-hidden rounded-3xl bg-elevated/80 backdrop-blur-xl px-6 py-14 sm:px-12 sm:py-20 text-center">
            <div className="absolute inset-0 bg-gradient-hero" aria-hidden="true" />
            <div className="noise-overlay" aria-hidden="true" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-content max-w-2xl">
                {title}
              </h2>
              <p className="text-content-secondary text-base sm:text-lg max-w-xl">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                <Magnetic>
                  <Link
                    to={primaryTo}
                    className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base"
                  >
                    {primaryLabel}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Magnetic>
                {secondaryLabel && (
                  <Link
                    to={secondaryTo}
                    className="btn-glow-outline px-8 py-3.5 text-base"
                  >
                    {secondaryLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
