'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Shield, TrendingUp, CheckCircle, Sparkles, Target, BarChart3, Users } from 'lucide-react'
import { LeadCaptureForm } from '@/components/forms/LeadCaptureForm'
import { CaseStudyCards } from '@/components/CaseStudyCards'
import { AwardsBadgeWall } from '@/components/AwardsBadgeWall'
import { TeamOfficeGrid } from '@/components/TeamOfficeGrid'
import { MilestoneTimeline } from '@/components/MilestoneTimeline'
import { LiveChatWidget } from '@/components/LiveChatWidget'
import { BlogJournalCards } from '@/components/BlogJournalCards'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { MegaNav } from '@/components/MegaNav'
import dynamic from 'next/dynamic'

// Dynamic imports for React Bits components (client-side only)
const LogoLoop = dynamic(() => import('@/components/react-bits/LogoLoop'), { ssr: false })
const LaserFlow = dynamic(() => import('@/components/react-bits/LaserFlow'), { ssr: false })
const SpecularButton = dynamic(() => import('@/components/react-bits/SpecularButton'), { ssr: false })
const TiltedCard = dynamic(() => import('@/components/react-bits/TiltedCard'), { ssr: false })
const GhostCursor = dynamic(() => import('@/components/GhostCursor'), { ssr: false })
const LiquidChrome = dynamic(() => import('@/components/react-bits/LiquidChrome'), { ssr: false })
const ElectricBorder = dynamic(() => import('@/components/react-bits/ElectricBorder'), { ssr: false })
const ShinyText = dynamic(() => import('@/components/react-bits/ShinyText'), { ssr: false })

// Client component for feature card
const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <ElectricBorder
        color="#7df9ff"
        speed={2}
        chaos={0.15}
        borderRadius={16}
        isActive={isHovered}
        className="h-full"
        style={{ padding: '2px' }}
      >
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 group h-full">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 rounded-lg flex-shrink-0 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
            <feature.icon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              <ShinyText
                text={feature.title}
                color="#e9d5ff"
                shineColor="#ffffff"
                speed={1.5}
                yoyo={true}
                spread={120}
                direction="left"
                className="text-purple-200"
              />
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">{feature.description}</p>
          </div>
        </div>
      </ElectricBorder>
    </motion.div>
  )
}

const features = [
  {
    icon: Zap,
    title: 'Instant Lead Capture',
    description: 'Capture leads in real-time with our streamlined form.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Your data is protected with enterprise-grade security.',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor lead status from new to closed.',
  },
  {
    icon: CheckCircle,
    title: 'Easy Management',
    description: 'Simple dashboard for efficient lead management.',
  },
]

// Partner/tech logos for LogoLoop component
const techLogos = [
  { 
    node: <Sparkles className="w-8 h-8 text-blue-500" />, 
    title: "AI Powered", 
  },
  { 
    node: <Target className="w-8 h-8 text-green-500" />, 
    title: "Targeted", 
  },
  { 
    node: <BarChart3 className="w-8 h-8 text-purple-500" />, 
    title: "Analytics", 
  },
  { 
    node: <Users className="w-8 h-8 text-orange-500" />, 
    title: "Team Ready", 
  },
  { 
    node: <Shield className="w-8 h-8 text-red-500" />, 
    title: "Secure", 
  },
  { 
    node: <TrendingUp className="w-8 h-8 text-cyan-500" />, 
    title: "Growth", 
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* LiquidChrome Background Effect - Full Page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <LiquidChrome
          baseColor={[0.15, 0.1, 0.2]}
          speed={0.3}
          amplitude={0.3}
          frequencyX={2.5}
          frequencyY={1.5}
          interactive={true}
        />
      </div>

      {/* GhostCursor Interactive Effect - Full Page */}
      <div className="fixed inset-0 pointer-events-auto z-[1]">
        <GhostCursor
          color="#B497CF"
          brightness={2}
          edgeIntensity={0}
          trailLength={50}
          inertia={0.5}
          grainIntensity={0.05}
          bloomStrength={0.1}
          bloomRadius={1}
          bloomThreshold={0.025}
          fadeDelayMs={1000}
          fadeDurationMs={1500}
        />
      </div>

      {/* LaserFlow Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-[2]">
        <LaserFlow
          horizontalBeamOffset={0.5}
          verticalBeamOffset={0.2}
          color="#B497CF"
          fogIntensity={0.3}
          wispDensity={0.8}
          flowSpeed={0.25}
        />
      </div>

      {/* Mega Navigation */}
      <MegaNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Interactive Experience</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
              <ShinyText
                text="Capture & Manage "
                color="#a855f7"
                shineColor="#ffffff"
                speed={1.5}
                yoyo={true}
                spread={120}
                direction="left"
                className="text-purple-500"
              />
              <ShinyText
                text="Leads"
                color="#c084fc"
                shineColor="#e9d5ff"
                speed={1.5}
                yoyo={true}
                spread={120}
                direction="left"
                className="text-purple-400"
              />
              <br />
              <ShinyText
                text="Effortlessly"
                color="#a855f7"
                shineColor="#ffffff"
                speed={1.5}
                yoyo={true}
                spread={120}
                direction="left"
                className="text-purple-500"
              />
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
              Streamline your lead generation process with our powerful yet simple platform. 
              Capture, track, and manage leads all in one place with a magical interactive experience.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </div>

            {/* CTA Buttons - Clean Flexbox Layout */}
            <div className="flex flex-row gap-4 items-center mt-8">
              <SpecularButton
                size="lg"
                onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                lineColor="#B497CF"
                baseColor="#7C3AED"
                tint="#E9D5FF"
                tintOpacity={0.3}
              >
                Get Started Free
              </SpecularButton>
              <SpecularButton
                size="lg"
                lineColor="#94A3B8"
                baseColor="#475569"
                tint="#F1F5F9"
                tintOpacity={0.2}
                onClick={() => window.open('https://digitalheroesco.com', '_blank')}
              >
                Learn More
              </SpecularButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Lead Form Card with ElectricBorder on hover */}
            <div 
              id="lead-form" 
              className="relative group"
              onMouseEnter={(e) => {
                const el = e.currentTarget.querySelector('.lead-form-electric') as HTMLElement
                if (el) el.dataset.active = 'true'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget.querySelector('.lead-form-electric') as HTMLElement
                if (el) el.dataset.active = 'false'
              }}
            >
              <ElectricBorder
                color="#ff00ff"
                speed={1.5}
                chaos={0.12}
                borderRadius={20}
                isActive={true}
                className="lead-form-electric opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ position: 'absolute', inset: '-8px', zIndex: 0 }}
              >
                <div />
              </ElectricBorder>
              <div className="relative z-10">
                <LeadCaptureForm />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Logo Loop Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="my-16"
        >
          <p className="text-center text-gray-500 text-sm mb-6 font-medium uppercase tracking-wider">
            Powered By Modern Technology
          </p>
          <div className="h-16 relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-100 via-white to-gray-100 border border-gray-200">
            <LogoLoop
              logos={techLogos}
              speed={80}
              direction="left"
              logoHeight={32}
              gap={48}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="#f9fafb"
              ariaLabel="Technology features"
            />
          </div>
        </motion.div>

        {/* Stats Section with ElectricBorder on hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative group"
          onMouseEnter={(e) => {
            const el = e.currentTarget.querySelector('.stats-electric') as HTMLElement
            if (el) el.dataset.active = 'true'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget.querySelector('.stats-electric') as HTMLElement
            if (el) el.dataset.active = 'false'
          }}
        >
          <ElectricBorder
            color="#ff6b35"
            speed={2}
            chaos={0.18}
            borderRadius={24}
            isActive={true}
            className="stats-electric opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ position: 'absolute', inset: '-10px', zIndex: 0 }}
          >
            <div />
          </ElectricBorder>
          <div className="bg-gradient-to-br from-purple-600/20 via-slate-800/50 to-pink-600/20 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden border border-purple-500/20 backdrop-blur-sm z-10">
            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-30">
              <LaserFlow
                horizontalBeamOffset={0.3}
                verticalBeamOffset={0.5}
                color="#B497CF"
                fogIntensity={0.5}
                wispDensity={1.2}
                flowSpeed={0.4}
              />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="group/stat relative">
                <div className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">100%</div>
                <div className="text-slate-300">Secure</div>
              </div>
              <div className="group/stat relative">
                <div className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">24/7</div>
                <div className="text-slate-300">Available</div>
              </div>
              <div className="group/stat relative">
                <div className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Fast</div>
                <div className="text-slate-300">Processing</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* NEW SECTION 1: Case Study Cards */}
        <CaseStudyCards />

        {/* NEW SECTION 2: Awards Badge Wall */}
        <AwardsBadgeWall />

        {/* NEW SECTION 3: Team + Office Grid */}
        <TeamOfficeGrid />

        {/* NEW SECTION 4: Milestone Timeline */}
        <MilestoneTimeline />

        {/* NEW SECTION 6: Blog Journal Cards */}
        <BlogJournalCards />

        {/* NEW SECTION 7: Newsletter Signup */}
        <NewsletterSignup />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-1.5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">LeadDesk Mini</span>
            </div>
            <p className="text-sm text-slate-400">
              <a 
                href="https://digitalheroesco.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Built for Digital Heroes Training Task
              </a>
            </p>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} LeadDesk Mini. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* NEW SECTION 5: Floating Live Chat Widget */}
      <LiveChatWidget />
    </div>
  )
}
