'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CaseStudy {
  id: string
  category: string
  headline: string
  stat: string
  growth?: string
  description: string
  metadata: string
  image?: string
  logo?: React.ReactNode
}

const featuredCaseStudy: CaseStudy = {
  id: '1',
  category: 'SaaS',
  headline: 'TechFlow Solutions',
  stat: '$2M MRR',
  growth: '+340%',
  description: 'Transformed their lead capture process and saw immediate results in qualified pipeline generation within 90 days.',
  metadata: 'Enterprise SaaS • 500+ employees',
  image: '/gradients/gradient-1.jpg',
}

const smallerCaseStudies: CaseStudy[] = [
  {
    id: '2',
    category: 'E-commerce',
    headline: 'ShopStream',
    stat: '10K+ Leads',
    description: 'Automated lead qualification and routing.',
    metadata: 'Retail • 50 employees',
    logo: <DollarSign className="w-8 h-8" />,
  },
  {
    id: '3',
    category: 'Agency',
    headline: 'Growth Labs',
    stat: '85% Conversion',
    description: 'Streamlined client intake and onboarding.',
    metadata: 'Marketing • 25 employees',
    logo: <Users className="w-8 h-8" />,
  },
]

function CaseStudyCard({ study, index, featured = false }: { study: CaseStudy; index: number; featured?: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  if (featured) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-8 md:p-10 group cursor-pointer"
      >
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        
        <div className="relative z-10">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            {study.category}
          </Badge>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{study.headline}</h3>
          
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {study.stat}
            </span>
            {study.growth && (
              <span className="flex items-center text-emerald-400 text-lg font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                {study.growth}
              </span>
            )}
          </div>
          
          <p className="text-slate-300 text-lg mb-6 max-w-2xl">{study.description}</p>
          
          <p className="text-slate-400 text-sm">{study.metadata}</p>
        </div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 group hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-slate-700/50 text-purple-400">
          {study.logo}
        </div>
        <Badge variant="outline" className="border-slate-600 text-slate-400">
          {study.category}
        </Badge>
      </div>
      
      <h4 className="text-xl font-bold text-white mb-2">{study.headline}</h4>
      
      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
        {study.stat}
      </p>
      
      <p className="text-slate-400 text-sm mb-4">{study.description}</p>
      
      <p className="text-slate-500 text-xs">{study.metadata}</p>
    </motion.div>
  )
}

export function CaseStudyCards() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            See how companies are transforming their lead management with LeadDesk Mini
          </p>
        </motion.div>

        {/* Featured Card */}
        <div className="mb-6">
          <CaseStudyCard study={featuredCaseStudy} index={0} featured />
        </div>

        {/* Smaller Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {smallerCaseStudies.map((study, index) => (
            <CaseStudyCard key={study.id} study={study} index={index + 1} />
          ))}
        </div>

        {/* See More Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors group"
          >
            See more case studies
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
