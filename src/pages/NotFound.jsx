import { Link } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroBackdrop from '../components/marketing/HeroBackdrop';
import { fadeInUp, staggerContainer } from '../lib/motion';

const NotFound = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-16 overflow-hidden">
      <HeroBackdrop />
      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-md"
      >
        <motion.span
          variants={fadeInUp}
          className="block font-display text-9xl font-bold gradient-text-hero animate-float"
        >
          404
        </motion.span>
        <motion.h1 variants={fadeInUp} className="mt-6 font-display text-3xl font-bold text-content">
          This chart went off the grid.
        </motion.h1>
        <motion.p variants={fadeInUp} className="mt-3 mb-8 text-content-secondary">
          The page you&apos;re looking for moved, expired, or never existed.
        </motion.p>
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            <Home className="w-4 h-4" />
            Go home
          </Link>
          <Link to="/courses" className="btn-glow-outline inline-flex items-center gap-2 px-6 py-3">
            <BookOpen className="w-4 h-4" />
            Browse courses
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
