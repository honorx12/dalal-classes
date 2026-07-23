import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Magnetic, TiltCard, staggerContainer, fadeInUp } from '../../lib/motion'

function formatPrice(paise) {
  if (!paise) return '0'
  return Math.round(paise / 100).toLocaleString('en-IN')
}

/**
 * Pricing tier card. Featured variant gets animated border + tilt + badge.
 * plan: { slug, name, description, price_monthly, price_yearly, features[] }
 */
export default function PricingCard({
  plan,
  cycle = 'monthly',
  featured = false,
  ctaLabel,
  ctaTo = '/signup',
  ctaOnClick,
  footnote,
  comingSoon = false,
}) {
  const price =
    cycle === 'yearly' ? Math.round((plan.price_yearly || 0) / 12) : plan.price_monthly || 0
  const isFree = !plan.price_monthly && !plan.price_yearly

  const inner = (
    <div className={featured ? 'pricing-card-featured h-full' : 'pricing-card h-full'}>
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-gradient-vivid text-white border-0 shadow-glow-brand">
          <Sparkles className="w-3 h-3 mr-1" />
          Most popular
        </span>
      )}

      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold text-content">{plan.name}</h3>
        <p className="mt-1 text-sm text-content-muted">{plan.description}</p>
      </div>

      <div className="mb-6 flex items-end gap-1.5 min-h-[3.5rem]">
        {comingSoon ? (
          <span className="font-display text-3xl font-bold text-content">Coming soon</span>
        ) : (
          <>
            <span className="text-lg text-content-muted mb-1">₹</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${plan.slug}-${cycle}`}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.25 }}
                className="font-display text-5xl font-bold text-content leading-none"
              >
                {formatPrice(price)}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-content-muted mb-1">/month</span>
          </>
        )}
      </div>
      {!comingSoon && !isFree && cycle === 'yearly' && (
        <p className="-mt-4 mb-4 text-xs text-content-muted">
          Billed ₹{formatPrice(plan.price_yearly)} yearly
        </p>
      )}

      <motion.ul
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-col gap-3 mb-8 flex-1"
      >
        {(plan.features || []).map((feature) => (
          <motion.li
            key={feature}
            variants={fadeInUp}
            className="flex items-start gap-2.5 text-sm text-content-secondary"
          >
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-emerald" />
            {feature}
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-auto">
        {ctaOnClick ? (
          <Magnetic>
            <button
              onClick={ctaOnClick}
              disabled={comingSoon}
              className={`w-full py-3 text-center ${
                featured ? 'btn-primary' : 'btn-glow-outline'
              } ${comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {ctaLabel}
            </button>
          </Magnetic>
        ) : (
          <Magnetic>
            <Link
              to={ctaTo}
              className={`block w-full py-3 text-center ${
                featured ? 'btn-primary' : 'btn-glow-outline'
              }`}
            >
              {ctaLabel}
            </Link>
          </Magnetic>
        )}
        {footnote && (
          <p className="mt-3 text-center text-xs text-content-muted">{footnote}</p>
        )}
      </div>
    </div>
  )

  if (featured) {
    return (
      <TiltCard className="h-full">
        <div className="animated-border rounded-2xl h-full">{inner}</div>
      </TiltCard>
    )
  }
  return inner
}
