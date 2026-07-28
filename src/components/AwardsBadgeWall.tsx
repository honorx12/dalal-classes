'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, Award, Trophy, Medal, Quote } from 'lucide-react'

interface AwardChip {
  year: string
  name: string
  category: string
}

interface Testimonial {
  id: string
  rating: number
  quote: string
  stat: string
  author: string
  role: string
}

const badges = [
  { id: '1', name: 'ISO 27001', icon: Award },
  { id: '2', name: 'SOC 2 Type II', icon: Trophy },
  { id: '3', name: 'GDPR Compliant', icon: Medal },
  { id: '4', name: 'AWS Partner', icon: Award },
  { id: '5', name: 'Google Cloud Partner', icon: Trophy },
  { id: '6', name: 'Microsoft Partner', icon: Medal },
]

const awardChips: AwardChip[] = [
  { year: '2024', name: 'Best CRM Software', category: 'G2 Crowd' },
  { year: '2024', name: 'Top 100 Software', category: 'Capterra' },
  { year: '2023', name: 'Innovation Award', category: 'SaaS Awards' },
  { year: '2023', name: 'Fastest Growing', category: 'Inc. 5000' },
]

const testimonials: Testimonial[] = [
  {
    id: '1',
    rating: 5,
    quote: 'LeadDesk Mini transformed our sales process. We have seen a 3x increase in qualified leads within the first quarter.',
    stat: '300% more qualified leads',
    author: 'Sarah Chen',
    role: 'VP of Sales',
  },
  {
    id: '2',
    rating: 5,
    quote: 'The automation features alone saved us 20 hours per week. Our team can now focus on closing deals instead of manual data entry.',
    stat: '20 hours saved weekly',
    author: 'Michael Torres',
    role: 'Sales Operations Manager',
  },
  {
    id: '3',
    rating: 5,
    quote: 'Best investment we have made. The ROI was visible within the first month of implementation.',
    stat: '5x ROI in 30 days',
    author: 'Emily Watson',
    role: 'CEO',
  },
]

export function AwardsBadgeWall() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Industry Recognition
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Trusted by leading organizations worldwide
          </p>
        </motion.div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-12">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="flex flex-col items-center p-6 rounded-xl bg-slate-800/30 border border-slate-700/30 grayscale group-hover:grayscale-0 group-hover:bg-slate-800/50 group-hover:border-purple-500/30 transition-all duration-300 cursor-pointer">
                <badge.icon className="w-10 h-10 text-slate-500 group-hover:text-purple-400 mb-3 transition-colors duration-300" />
                <span className="text-sm text-slate-400 group-hover:text-slate-200 text-center transition-colors duration-300">
                  {badge.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Award Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {awardChips.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            >
              <span className="text-xs font-medium text-purple-400">{award.year}</span>
              <span className="text-sm text-slate-300">{award.name}</span>
              <span className="text-xs text-slate-500">• {award.category}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="relative p-6 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <div className="relative mb-4">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-purple-500/20" />
                <p className="text-slate-300 text-sm leading-relaxed pl-4">
                  {testimonial.quote}
                </p>
              </div>

              {/* Stat */}
              <div className="mb-4">
                <span className="text-sm font-semibold text-purple-400">
                  {testimonial.stat}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{testimonial.author}</p>
                  <p className="text-slate-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
