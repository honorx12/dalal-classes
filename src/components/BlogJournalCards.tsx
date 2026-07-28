'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, ArrowRight, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  readTime: string
  image?: string
  featured?: boolean
}

const featuredPost: BlogPost = {
  id: '1',
  title: '10 Lead Management Strategies That Actually Work in 2024',
  excerpt: 'Discover proven techniques used by top-performing sales teams to convert more leads into customers. Learn about automation, personalization, and the metrics that matter.',
  category: 'Strategy',
  readTime: '8 min read',
  image: '/gradients/gradient-1.jpg',
  featured: true,
}

const blogPosts: BlogPost[] = [
  {
    id: '2',
    title: 'The Complete Guide to Lead Scoring',
    excerpt: 'How to prioritize your leads effectively using data-driven scoring models.',
    category: 'Guide',
    readTime: '5 min read',
  },
  {
    id: '3',
    title: 'CRM Best Practices for Small Teams',
    excerpt: 'Maximize your CRM investment with these proven tips and workflows.',
    category: 'Tips',
    readTime: '4 min read',
  },
  {
    id: '4',
    title: 'Automating Your Sales Funnel',
    excerpt: 'Save hours every week with smart automation that never feels robotic.',
    category: 'Automation',
    readTime: '6 min read',
  },
]

export function BlogJournalCards() {
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
            From the Journal
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Insights, guides, and tips to help you master lead management
          </p>
        </motion.div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <a href="#" className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-6 md:p-8 hover:border-purple-500/30 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {featuredPost.category}
                  </Badge>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-slate-400 mb-4 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </div>
                    
                    <span className="inline-flex items-center gap-1 text-purple-400 text-sm font-medium group-hover:gap-2 transition-all duration-300">
                      Read more
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  {/* Placeholder Image Area */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 text-purple-400/50 mx-auto mb-2" />
                      <span className="text-slate-500 text-sm">Featured Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </motion.div>

        {/* Smaller Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="group block"
            >
              <div className="h-full p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800/70 transition-all duration-300">
                <Badge variant="outline" className="mb-3 border-slate-600 text-slate-400">
                  {post.category}
                </Badge>
                
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
                  {post.title}
                </h4>
                
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
