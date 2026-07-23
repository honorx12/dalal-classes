import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronDown, Building2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { isRazorpayConfigured, isWorkerConfigured } from '../lib/env'
import { useAuthStore } from '../store/useAuthStore'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import HeroBackdrop from '../components/marketing/HeroBackdrop'
import SectionHeading from '../components/marketing/SectionHeading'
import GlowCTA from '../components/marketing/GlowCTA'
import PricingCard from '../components/pricing/PricingCard'
import BillingToggle from '../components/pricing/BillingToggle'
import { Reveal, StaggerGroup, StaggerItem, fadeInUp, blurInUp, SplitWords } from '../lib/motion'

// Used until migration 004 is applied — keeps the page fully functional.
const FALLBACK_PLANS = [
  {
    slug: 'free',
    name: 'Free',
    description: 'Everything you need to start learning',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      'All free courses',
      'Community discussions',
      'Progress tracking',
      'Quizzes & self-assessment',
    ],
  },
  {
    slug: 'pro',
    name: 'Pro',
    description: 'Full access for serious learners',
    price_monthly: 49900,
    price_yearly: 478800,
    features: [
      'Everything in Free',
      'All Pro courses',
      'Verified certificates',
      'Downloadable PDF materials',
      'Priority support',
      'Early access to new courses',
    ],
  },
]

const TEAMS_PLAN = {
  slug: 'teams',
  name: 'Academy',
  description: 'Launch your own academy on Dalal Classes',
  features: [
    'Your own branded academy',
    'Invite your students',
    'Publish your courses',
    'Revenue tools built in',
    'Dedicated support',
  ],
}

const COMPARISON = [
  { feature: 'Free courses', free: true, pro: true },
  { feature: 'Progress tracking', free: true, pro: true },
  { feature: 'Quizzes & self-assessment', free: true, pro: true },
  { feature: 'Community discussions', free: true, pro: true },
  { feature: 'Pro courses', free: false, pro: true },
  { feature: 'Verified certificates', free: false, pro: true },
  { feature: 'Downloadable PDF materials', free: false, pro: true },
  { feature: 'Priority support', free: false, pro: true },
  { feature: 'Early access to new courses', free: false, pro: true },
]

const FAQS = [
  {
    q: 'Is the Free plan really free forever?',
    a: 'Yes. Free courses, progress tracking, quizzes, and discussions stay free. No credit card required, no trial that expires.',
  },
  {
    q: 'What do I get with Pro?',
    a: 'Every course on the platform — including Pro-only courses — plus verified certificates, downloadable PDF materials, priority support, and early access to new content.',
  },
  {
    q: 'Can I switch between monthly and yearly billing?',
    a: 'Yes. You can switch billing cycles at any time; yearly billing saves about 20% compared to paying monthly.',
  },
  {
    q: 'How do I cancel?',
    a: 'You can cancel anytime from your profile. You keep Pro access until the end of your current billing period.',
  },
  {
    q: 'What is the Academy plan?',
    a: 'Academy lets educators launch their own branded learning portal on our platform — your courses, your students, your brand. It is coming soon; join the waitlist to get early access.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'If something is not right, contact us within 7 days of purchase and we will make it right.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card-raised overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-medium text-content">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-5 h-5 text-content-muted shrink-0" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <p className="px-5 pb-5 text-sm text-content-secondary leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PricingPage() {
  const [cycle, setCycle] = useState('monthly')
  const [plans, setPlans] = useState(FALLBACK_PLANS)
  const { user } = useAuthStore()
  const isPro = useSubscriptionStore((s) => s.plan === 'pro')

  const paymentsLive = isRazorpayConfigured() && isWorkerConfigured()

  useEffect(() => {
    let cancelled = false
    async function loadPlans() {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true })
        if (!cancelled && !error && data?.length) setPlans(data)
      } catch {
        // table missing pre-migration — fallback stays
      }
    }
    loadPlans()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.title = 'Pricing — Dalal Classes'
  }, [])

  const freePlan = plans.find((p) => p.slug === 'free') || FALLBACK_PLANS[0]
  const proPlan = plans.find((p) => p.slug === 'pro') || FALLBACK_PLANS[1]

  const proCta = isPro
    ? { label: 'You are on Pro', to: '/profile' }
    : paymentsLive
      ? { label: 'Upgrade to Pro', to: user ? '/profile' : '/signup' }
      : {
          label: 'Get early access',
          href: 'mailto:hello@dalalclasses.com?subject=Pro%20early%20access',
        }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="section-container relative z-10 pt-20 pb-12 sm:pt-28 text-center">
          <motion.span
            variants={blurInUp}
            initial="hidden"
            animate="show"
            className="section-label"
          >
            Pricing
          </motion.span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-content">
            <SplitWords text="Simple pricing. Serious results." />
          </h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-content-secondary"
          >
            Start free. Go Pro when you are ready. Cancel anytime.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="mt-8 flex justify-center"
          >
            <BillingToggle cycle={cycle} onChange={setCycle} />
          </motion.div>
        </div>
      </section>

      {/* Tier cards */}
      <section className="section-container pb-20">
        <StaggerGroup
          delay={0.12}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto"
        >
          <StaggerItem variants={fadeInUp} className="h-full">
            <PricingCard
              plan={freePlan}
              cycle={cycle}
              ctaLabel={user ? 'Browse courses' : 'Start free'}
              ctaTo={user ? '/courses' : '/signup'}
              footnote="Free forever. No card required."
            />
          </StaggerItem>
          <StaggerItem variants={fadeInUp} className="h-full">
            {proCta.href ? (
              <PricingCard
                plan={proPlan}
                cycle={cycle}
                featured
                ctaLabel={proCta.label}
                ctaOnClick={() => (window.location.href = proCta.href)}
                footnote="Payments launching soon — lock in early access."
              />
            ) : (
              <PricingCard
                plan={proPlan}
                cycle={cycle}
                featured
                ctaLabel={proCta.label}
                ctaTo={proCta.to}
              />
            )}
          </StaggerItem>
          <StaggerItem variants={fadeInUp} className="h-full">
            <PricingCard
              plan={TEAMS_PLAN}
              cycle={cycle}
              comingSoon
              ctaLabel="Join the waitlist"
              ctaOnClick={() =>
                (window.location.href =
                  'mailto:hello@dalalclasses.com?subject=Academy%20waitlist')
              }
              footnote="For educators & institutions."
            />
          </StaggerItem>
        </StaggerGroup>
      </section>

      {/* Comparison table */}
      <section className="section-container pb-20">
        <SectionHeading
          label="Compare"
          title="Every plan, side by side"
          className="mb-10"
        />
        <Reveal className="max-w-3xl mx-auto card-raised overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line/10">
                <th className="text-left font-medium text-content-muted p-4">Feature</th>
                <th className="font-medium text-content p-4 w-24">Free</th>
                <th className="font-semibold gradient-text p-4 w-24">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="border-b border-line/5 last:border-0"
                >
                  <td className="p-4 text-content-secondary">{row.feature}</td>
                  <td className="p-4 text-center">
                    {row.free ? (
                      <Check className="w-4 h-4 mx-auto text-accent-emerald" />
                    ) : (
                      <X className="w-4 h-4 mx-auto text-content-muted/50" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {row.pro ? (
                      <Check className="w-4 h-4 mx-auto text-accent-emerald" />
                    ) : (
                      <X className="w-4 h-4 mx-auto text-content-muted/50" />
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      {/* Academy teaser */}
      <section className="section-container pb-20">
        <Reveal className="max-w-3xl mx-auto">
          <div className="card-raised p-8 sm:p-10 flex flex-col sm:flex-row items-start gap-6">
            <div className="icon-container shrink-0">
              <Building2 className="w-7 h-7 text-brand" />
            </div>
            <div>
              <span className="badge mb-3">Coming soon</span>
              <h3 className="font-display text-2xl font-bold text-content mb-2">
                Launch your own academy
              </h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                Educators: bring your students, publish your courses, and run your own
                branded learning portal on our platform. Join the waitlist and be first
                in line when Academy opens.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="section-container pb-20">
        <SectionHeading label="FAQ" title="Questions, answered" className="mb-10" />
        <StaggerGroup delay={0.06} className="max-w-2xl mx-auto flex flex-col gap-3">
          {FAQS.map((faq) => (
            <StaggerItem key={faq.q} variants={fadeInUp}>
              <FaqItem q={faq.q} a={faq.a} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <GlowCTA
        title="Ready when you are"
        subtitle="Join thousands of learners mastering the markets — start free today."
      />
    </div>
  )
}
