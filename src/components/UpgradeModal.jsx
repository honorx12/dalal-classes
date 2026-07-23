import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Check, ArrowRight } from 'lucide-react'

const PRO_BENEFITS = [
  'All Pro courses unlocked',
  'Verified certificates',
  'Downloadable PDF materials',
  'Priority support',
  'Early access to new courses',
]

/**
 * Shown when a free user tries to enroll in a Pro course.
 * Routes to /pricing — no payment execution here.
 */
export default function UpgradeModal({ open, onClose, courseTitle }) {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="animated-border rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl bg-elevated p-8">
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 p-1.5 rounded-lg text-content-muted hover:text-content hover:bg-surface/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="icon-container mb-5">
                <Crown className="w-7 h-7 text-brand" />
              </div>

              <h3 className="font-display text-2xl font-bold text-content mb-2">
                This is a Pro course
              </h3>
              <p className="text-sm text-content-secondary mb-6">
                {courseTitle ? (
                  <>
                    <span className="font-medium text-content">{courseTitle}</span> is included
                    in the Pro plan, along with:
                  </>
                ) : (
                  'This course is included in the Pro plan, along with:'
                )}
              </p>

              <ul className="flex flex-col gap-2.5 mb-8">
                {PRO_BENEFITS.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 text-sm text-content-secondary"
                  >
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-emerald" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  onClose()
                  navigate('/pricing')
                }}
                className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2"
              >
                See Pro plans
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="mt-3 text-center text-xs text-content-muted">
                Free courses stay free. Forever.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
