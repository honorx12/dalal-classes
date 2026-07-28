'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Rocket, Users, Zap, Building, Award, Globe } from 'lucide-react'

interface Milestone {
  year: string
  title: string
  description: string
  icon: React.ElementType
}

const milestones: Milestone[] = [
  {
    year: '2021',
    title: 'Founded in San Francisco',
    description: 'LeadDesk Mini was born from a simple idea: make lead management accessible to everyone.',
    icon: Rocket,
  },
  {
    year: '2022',
    title: 'First 1,000 Customers',
    description: 'Reached our first milestone serving over 1,000 businesses across 15 countries.',
    icon: Users,
  },
  {
    year: '2022',
    title: 'Series A Funding',
    description: 'Raised $5M to expand our team and accelerate product development.',
    icon: Zap,
  },
  {
    year: '2023',
    title: 'International Expansion',
    description: 'Opened offices in London and Singapore to serve global customers.',
    icon: Building,
  },
  {
    year: '2023',
    title: 'Industry Recognition',
    description: 'Named "Best CRM Software" by G2 Crowd and featured in top tech publications.',
    icon: Award,
  },
  {
    year: '2024',
    title: '50,000+ Active Users',
    description: 'Now trusted by over 50,000 users worldwide, processing millions of leads monthly.',
    icon: Globe,
  },
]

function TimelineEntry({ milestone, index }: { milestone: Milestone; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`flex items-center gap-4 md:gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
    >
      {/* Content Card */}
      <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'} text-left`}>
        <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-colors duration-300">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-semibold mb-3">
            {milestone.year}
          </span>
          <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
          <p className="text-slate-400 text-sm">{milestone.description}</p>
        </div>
      </div>

      {/* Center Icon */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-10 relative">
          <milestone.icon className="w-5 h-5 text-white" />
        </div>
        {/* Connecting Line */}
        {index < milestones.length - 1 && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+2rem)] bg-gradient-to-b from-purple-500/50 to-slate-700/30 hidden md:block" />
        )}
      </div>

      {/* Spacer for alternating layout */}
      <div className="flex-1 hidden md:block" />
    </motion.div>
  )
}

export function MilestoneTimeline() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-slate-950/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Journey
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From a small startup to a global platform, here is how we got here
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-8 md:space-y-12">
          {milestones.map((milestone, index) => (
            <TimelineEntry key={index} milestone={milestone} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
