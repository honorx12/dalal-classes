'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Users, Building2, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Location {
  id: string
  city: string
  country: string
  headcount: string
  image: string
}

interface Founder {
  name: string
  title: string
  quote: string
  stats: { label: string; value: string }[]
}

const locations: Location[] = [
  {
    id: '1',
    city: 'San Francisco',
    country: 'United States',
    headcount: '45',
    image: '/gradients/gradient-1.jpg',
  },
  {
    id: '2',
    city: 'London',
    country: 'United Kingdom',
    headcount: '28',
    image: '/gradients/gradient-2.jpg',
  },
  {
    id: '3',
    city: 'Singapore',
    country: 'Singapore',
    headcount: '15',
    image: '/gradients/gradient-3.jpg',
  },
]

const founder: Founder = {
  name: 'Alex Rivera',
  title: 'Founder & CEO',
  quote: 'Our mission is to democratize lead management for businesses of all sizes.',
  stats: [
    { label: 'Years Experience', value: '15+' },
    { label: 'Companies Built', value: '3' },
    { label: 'Team Members', value: '88' },
  ],
}

export function TeamOfficeGrid() {
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
            Our Global Team
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Building the future of lead management from around the world
          </p>
        </motion.div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl h-64 cursor-pointer"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400 text-sm">{location.country}</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{location.city}</h3>

                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50">
                    <Users className="w-3 h-3 mr-1" />
                    {location.headcount} team members
                  </Badge>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-purple-500/10" />
            </motion.div>
          ))}
        </div>

        {/* Founder Bio Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-8 md:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Founder Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {founder.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{founder.name}</h3>
                  <p className="text-purple-400 font-medium">{founder.title}</p>
                </div>
              </div>

              <blockquote className="text-xl text-slate-300 italic mb-6 border-l-4 border-purple-500 pl-4">
                {founder.quote}
              </blockquote>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {founder.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
