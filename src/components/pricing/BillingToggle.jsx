import { motion, AnimatePresence } from 'framer-motion'

/**
 * Monthly / Yearly segmented control with sliding layoutId thumb.
 */
export default function BillingToggle({ cycle, onChange }) {
  const options = [
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ]

  return (
    <div className="inline-flex items-center gap-3">
      <div
        role="tablist"
        aria-label="Billing cycle"
        className="relative inline-flex rounded-full border border-line/10 bg-elevated/70 backdrop-blur-xl p-1"
      >
        {options.map((opt) => (
          <button
            key={opt.key}
            role="tab"
            aria-selected={cycle === opt.key}
            onClick={() => onChange(opt.key)}
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              cycle === opt.key ? 'text-white' : 'text-content-secondary hover:text-content'
            }`}
          >
            {cycle === opt.key && (
              <motion.span
                layoutId="billing-thumb"
                className="absolute inset-0 rounded-full bg-gradient-vivid"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {cycle === 'yearly' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -8 }}
            className="badge-success"
          >
            Save 20%
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
