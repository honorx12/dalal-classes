import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  fadeInUp,
  blurInUp,
  staggerContainer,
  Reveal,
  StaggerGroup,
  StaggerItem,
  Magnetic,
  TiltCard,
  Marquee,
  SplitWords,
  slideInLeft,
  slideInRight,
} from '../lib/motion';
import HeroBackdrop from '../components/marketing/HeroBackdrop';
import SectionHeading from '../components/marketing/SectionHeading';
import { BentoGrid, BentoCell } from '../components/marketing/BentoGrid';
import LogoMarquee from '../components/marketing/LogoMarquee';
import StatsRow from '../components/marketing/StatsRow';
import GlowCTA from '../components/marketing/GlowCTA';
import PricingCard from '../components/pricing/PricingCard';
import {
  Award,
  Play,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Brain,
  TrendingUp,
  Star,
  BarChart3,
  MessageSquare,
  FileText,
  Quote,
} from 'lucide-react';

// Animated Node Graph Component - Shows course structure as visual proof
const CourseStructureGraph = ({ className }) => {
  const [activeNodes, setActiveNodes] = useState(3);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setActiveNodes(10);
      return;
    }

    const interval = setInterval(() => {
      setActiveNodes(prev => {
        if (prev >= 10) return 0;
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Generate node positions for 10 chapters in a flowing path
  const nodes = Array.from({ length: 10 }, (_, i) => {
    const row = Math.floor(i / 5);
    const col = row % 2 === 0 ? i % 5 : 4 - (i % 5);
    const x = 50 + col * 100;
    const y = 50 + row * 80;
    return { x, y, i: i + 1 };
  });

  // Generate connections between nodes
  const connections = nodes.slice(0, -1).map((node, i) => ({
    x1: node.x,
    y1: node.y,
    x2: nodes[i + 1].x,
    y2: nodes[i + 1].y,
    active: i < activeNodes - 1
  }));

  return (
    <svg viewBox="0 0 550 220" className={`w-full h-full text-content-muted ${className}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 40" fill="none" stroke="rgba(124, 58, 237, 0.06)" strokeWidth="1"/>
        </pattern>
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {connections.map((conn, i) => (
        <line
          key={i}
          x1={conn.x1}
          y1={conn.y1}
          x2={conn.active ? conn.x2 : conn.x1}
          y2={conn.active ? conn.y2 : conn.y1}
          stroke={conn.active ? "url(#pathGradient)" : "currentColor"}
          strokeOpacity={conn.active ? 1 : 0.3}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      {nodes.map((node, i) => {
        const isActive = i < activeNodes;
        const isCurrent = i === activeNodes - 1 && activeNodes > 0 && activeNodes < 10;

        return (
          <g key={i}>
            <circle
              cx={node.x}
              cy={node.y}
              r="20"
              fill="none"
              stroke={isActive ? "url(#pathGradient)" : "currentColor"}
              strokeOpacity={isActive ? 1 : 0.3}
              strokeWidth="2"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="14"
              fill={isActive ? "url(#nodeGradient)" : "currentColor"}
              fillOpacity={isActive ? 1 : 0.15}
            />
            {isActive && (
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                {String(node.i).padStart(2, '0')}
              </text>
            )}
            {isCurrent && (
              <circle
                cx={node.x}
                cy={node.y}
                r="24"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            )}
          </g>
        );
      })}

      <text x="50" y="185" fill="currentColor" fontSize="11" fontFamily="Inter, sans-serif">
        Chapter 1: Foundation
      </text>
      <text x="500" y="185" fill="currentColor" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="end">
        Chapter 10: Mastery
      </text>
    </svg>
  );
};

const HOW_IT_WORKS = [
  { step: '01', title: 'Start free', desc: 'Create an account and enroll instantly — no payment, no card.' },
  { step: '02', title: 'Learn in modules', desc: 'Bite-sized lessons with notes, bookmarks, and discussions.' },
  { step: '03', title: 'Pass the quiz', desc: 'Score 75% to unlock the next chapter. Mastery, verified.' },
  { step: '04', title: 'Earn your certificate', desc: 'Finish every chapter and walk away with proof.' },
];

const TESTIMONIALS = [
  { name: 'Aarav S.', role: 'Swing trader', text: 'The quiz-gated chapters forced me to actually understand price action instead of skimming videos.' },
  { name: 'Priya M.', role: 'Finance student', text: 'Cleanest structured curriculum I have found. The progress tracking keeps me honest.' },
  { name: 'Rohan K.', role: 'Working professional', text: 'Finished my first course in three weekends. Certificate went straight on my profile.' },
  { name: 'Sneha T.', role: 'Beginner investor', text: 'Started from zero. The sequential unlocking meant I never felt lost or overwhelmed.' },
  { name: 'Vikram D.', role: 'Analyst', text: 'The discussions under each lesson are gold — real questions, real answers.' },
  { name: 'Ananya R.', role: 'Self-taught trader', text: 'Free tier is genuinely free. Upgraded to Pro just to support them — and the Pro courses delivered.' },
];

const TEASER_PLANS = [
  {
    slug: 'free',
    name: 'Free',
    description: 'Everything you need to start',
    price_monthly: 0,
    price_yearly: 0,
    features: ['All free courses', 'Progress tracking', 'Quizzes & discussions'],
  },
  {
    slug: 'pro',
    name: 'Pro',
    description: 'Full access for serious learners',
    price_monthly: 49900,
    price_yearly: 478800,
    features: ['Everything in Free', 'All Pro courses', 'Verified certificates', 'PDF downloads'],
  },
];

// Scroll-linked drawing line connecting the how-it-works steps
const TimelineLine = ({ containerRef }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 60%'],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <svg
      className="hidden md:block absolute left-0 right-0 top-9 w-full h-2 pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 100 2"
      aria-hidden="true"
    >
      <motion.line
        x1="4" y1="1" x2="96" y2="1"
        stroke="url(#timeline-grad)"
        strokeWidth="0.4"
        style={{ pathLength }}
      />
      <defs>
        <linearGradient id="timeline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const HomePage = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState({});
  const [realStats, setRealStats] = useState({ courses: 0, modules: 0, chapters: 0 });
  const timelineRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: coursesData } = await supabase
        .from('courses')
        .select('*, chapters(count)')
        .order('created_at');

      const coursesWithCounts = coursesData?.map(c => ({
        ...c,
        chapter_count: c.chapters?.count || 0
      })) || [];
      setCourses(coursesWithCounts);

      const [{ data: modulesData }, { data: chaptersData }] = await Promise.all([
        supabase.from('modules').select('count'),
        supabase.from('chapters').select('count')
      ]);

      setRealStats({
        courses: coursesWithCounts.length,
        modules: modulesData?.[0]?.count || 400,
        chapters: chaptersData?.[0]?.count || 50
      });

      if (user) {
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id);

        const enrollMap = {};
        enrollData?.forEach(e => {
          enrollMap[e.course_id] = e;
        });
        setEnrollments(enrollMap);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-base">
      {/* ============ Hero ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <HeroBackdrop />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="text-left order-2 lg:order-1"
              variants={staggerContainer(0.1)}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={blurInUp}>
                <Link
                  to="/pricing"
                  className="animated-border inline-flex items-center gap-2 px-4 py-2 rounded-full bg-elevated/70 backdrop-blur-sm mb-6 group"
                >
                  <Sparkles className="w-4 h-4 text-accent-amber" />
                  <span className="text-sm font-medium text-content-secondary">
                    <span className="gradient-text font-bold">New:</span> Pro plans are here
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-content-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 mt-4 leading-[1.08] text-content">
                <SplitWords text="Master the markets." delay={0.05} />
                <br />
                <span className="gradient-text-hero">
                  <SplitWords text="One platform." delay={0.05} />
                </span>
              </h1>

              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-content-secondary mb-8 max-w-lg leading-relaxed mt-8">
                Structured trading education with progress tracking, quizzes, and
                certificates. Start free — go Pro when you&apos;re ready.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-12">
                <Magnetic>
                  <Link to={user ? '/courses' : '/signup'} className="btn-primary group inline-flex items-center justify-center gap-2 px-8 py-4 font-display text-lg w-full sm:w-auto">
                    <Play className="w-5 h-5 fill-white" />
                    Start learning free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Magnetic>
                <Link to="/pricing" className="btn-glow-outline inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold font-display">
                  View pricing
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 text-sm text-content-muted">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald" />No credit card</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald" />Free forever tier</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald" />Certificates included</span>
              </motion.div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2"
              variants={fadeInUp}
              initial="hidden"
              animate="show"
            >
              <TiltCard>
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-vivid opacity-20 rounded-3xl blur-2xl" />
                  <div className="relative glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-content-muted">Learning Path</span>
                      <span className="flex items-center gap-1.5 text-xs text-accent-emerald">
                        <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                        Live Progression
                      </span>
                    </div>
                    <CourseStructureGraph className="h-48 md:h-56" />
                    <div className="mt-4 flex items-center justify-between text-xs text-content-muted">
                      <span>10 chapters</span>
                      <span>8 modules each</span>
                      <span>Quiz-gated</span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-line/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-content-muted rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ============ Social proof marquee ============ */}
      <section className="border-y border-line/5">
        <div className="section-container">
          <LogoMarquee />
        </div>
      </section>

      {/* ============ Stats ============ */}
      <section className="section-container py-16">
        <StatsRow
          stats={[
            { value: realStats.courses || 5, label: 'Courses', suffix: '' },
            { value: realStats.chapters || 50, label: 'Chapters', suffix: '+' },
            { value: realStats.modules || 400, label: 'Modules', suffix: '+' },
            { value: 75, label: 'Pass mark to advance', suffix: '%' },
          ]}
        />
      </section>

      {/* ============ How it works — timeline ============ */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="How it works"
            title="Your path to mastery"
            subtitle="A structured approach that ensures you build skills progressively — never lost, never overwhelmed."
            className="mb-16"
          />

          <div ref={timelineRef} className="relative">
            <TimelineLine containerRef={timelineRef} />
            <StaggerGroup className="grid md:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((item, i) => (
                <StaggerItem key={item.step} variants={i % 2 === 0 ? slideInLeft : slideInRight} className="relative">
                  <div className="p-6 rounded-2xl glass-card-hover h-full">
                    <span className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-fresh text-white font-display text-lg font-bold shadow-glow-emerald">{item.step}</span>
                    <h3 className="font-display text-lg font-semibold text-content mt-4 mb-2">{item.title}</h3>
                    <p className="text-content-secondary text-sm">{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* ============ Features — bento ============ */}
      <section className="py-24 relative">
        <div className="section-container">
          <SectionHeading
            label="Built for serious learners"
            title="Structure that delivers results"
            subtitle="Every element designed to help you actually learn — not just consume content."
            className="mb-16"
          />

          <BentoGrid>
            <BentoCell colSpan={2} rowSpan={2}>
              <div className="flex flex-col h-full">
                <div className="icon-container mb-5">
                  <Brain className="w-7 h-7 text-brand" />
                </div>
                <h3 className="font-display text-2xl font-bold text-content mb-2">Sequential mastery</h3>
                <p className="text-content-secondary text-sm leading-relaxed mb-6 max-w-md">
                  Ten chapters per course, unlocked one at a time. Pass each quiz at 75%
                  to advance — so every skill is built on a foundation that holds.
                </p>
                <div className="mt-auto grid grid-cols-5 gap-2">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                      className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                        i < 6
                          ? 'bg-gradient-vivid text-white'
                          : 'bg-surface/[0.06] text-content-muted border border-line/10'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </motion.div>
                  ))}
                </div>
              </div>
            </BentoCell>

            <BentoCell>
              <div className="icon-container mb-4">
                <BarChart3 className="w-6 h-6 text-accent-cyan" />
              </div>
              <h3 className="font-display text-lg font-semibold text-content mb-1.5">Never lose your place</h3>
              <p className="text-content-secondary text-sm">Progress syncs across every device, automatically.</p>
            </BentoCell>

            <BentoCell>
              <div className="icon-container mb-4">
                <Award className="w-6 h-6 text-accent-amber" />
              </div>
              <h3 className="font-display text-lg font-semibold text-content mb-1.5">Prove it</h3>
              <p className="text-content-secondary text-sm">Earn a verified certificate the moment you finish.</p>
            </BentoCell>

            <BentoCell>
              <div className="icon-container mb-4">
                <MessageSquare className="w-6 h-6 text-accent-emerald" />
              </div>
              <h3 className="font-display text-lg font-semibold text-content mb-1.5">Learn together</h3>
              <p className="text-content-secondary text-sm">Discussions on every lesson — ask, answer, grow.</p>
            </BentoCell>

            <BentoCell>
              <div className="icon-container mb-4">
                <FileText className="w-6 h-6 text-accent-rose" />
              </div>
              <h3 className="font-display text-lg font-semibold text-content mb-1.5">Notes & bookmarks</h3>
              <p className="text-content-secondary text-sm">Capture insights in place and jump back anytime.</p>
            </BentoCell>
          </BentoGrid>
        </div>
      </section>

      {/* ============ Courses preview ============ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/5 to-transparent" />
        <div className="relative section-container">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="section-label mb-3 inline-block">
                <TrendingUp className="w-4 h-4 inline mr-1.5 -mt-0.5" />Catalog
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-content mb-4">
                Explore our <span className="gradient-text">courses</span>
              </h2>
              <p className="text-content-secondary max-w-xl">Start your learning journey today — free tier always available.</p>
            </div>
            <Link to="/courses" className="mt-6 md:mt-0 inline-flex items-center gap-2 px-6 py-3 text-brand font-semibold hover:text-accent-cyan transition-colors group">
              View all courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>

          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="course-card animate-pulse">
                  <div className="h-44 bg-line/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-line/10 rounded w-3/4" />
                    <div className="h-4 bg-line/10 rounded w-full" />
                  </div>
                </div>
              ))
            ) : (
              courses.slice(0, 5).map((course) => (
                <StaggerItem key={course.id}>
                  <CourseCard course={course} enrollment={enrollments[course.id]} />
                </StaggerItem>
              ))
            )}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ Pricing teaser ============ */}
      <section className="py-24">
        <div className="section-container">
          <SectionHeading
            label="Pricing"
            title="Start free. Upgrade when ready."
            subtitle="The free tier is free forever. Pro unlocks everything else."
            className="mb-14"
          />
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <PricingCard
              plan={TEASER_PLANS[0]}
              ctaLabel={user ? 'Browse courses' : 'Start free'}
              ctaTo={user ? '/courses' : '/signup'}
            />
            <PricingCard
              plan={TEASER_PLANS[1]}
              featured
              ctaLabel="Compare plans"
              ctaTo="/pricing"
            />
          </div>
        </div>
      </section>

      {/* ============ Testimonials marquee ============ */}
      <section className="py-24 overflow-hidden">
        <SectionHeading
          label="Learners"
          title="Trusted by people who take it seriously"
          className="mb-14 px-4"
        />
        <div className="flex flex-col gap-6">
          <Marquee>
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <div key={t.name} className="testimonial-card w-80 shrink-0">
                <Quote className="w-5 h-5 text-brand/50 mb-3" />
                <p className="text-sm text-content-secondary leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-vivid flex items-center justify-center text-white text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">{t.name}</p>
                    <p className="text-xs text-content-muted">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-accent-amber text-accent-amber" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
          <Marquee reverse>
            {TESTIMONIALS.slice(3).map((t) => (
              <div key={t.name} className="testimonial-card w-80 shrink-0">
                <Quote className="w-5 h-5 text-brand/50 mb-3" />
                <p className="text-sm text-content-secondary leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-fresh flex items-center justify-center text-white text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">{t.name}</p>
                    <p className="text-xs text-content-muted">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-accent-amber text-accent-amber" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ============ Final CTA ============ */}
      <GlowCTA
        title="Ready to start learning?"
        subtitle="Join thousands of learners building skills that matter — free to start, forever."
      />
    </div>
  );
};

export default HomePage;
