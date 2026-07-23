import { Link } from 'react-router-dom';
import { Clock, BookOpen, Award, Play, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import PlanBadge from './PlanBadge';

const CourseCard = ({ course, enrollment }) => {
  const [isHovered, setIsHovered] = useState(false);
  const progress = enrollment?.progress || 0;
  const isCompleted = progress === 100;
  const isPro = (course.price || 0) > 0;

  // Generate consistent gradient based on course ID
  const gradients = [
    'from-violet-500 to-fuchsia-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ];
  const gradientIndex = course.id ? course.id.charCodeAt(0) % gradients.length : 0;
  const cardGradient = gradients[gradientIndex];

  return (
    <Link
      to={`/courses/${course.id}`}
      className="block group h-full focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-base rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="course-card h-full flex flex-col">
        {/* Image Section */}
        <div className={`h-44 relative overflow-hidden bg-gradient-to-br ${cardGradient}`}>
          {/* Background Pattern - Code aesthetic */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />
          </div>

          {/* Animated grid lines on hover */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Initial Letter */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-display text-7xl font-black text-white/20 select-none transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
              {course.title?.charAt(0) || 'C'}
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
              {course.level || 'Beginner'}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <PlanBadge plan={isPro ? 'pro' : 'free'} />
          </div>

          {/* Hover Overlay with improved animation */}
          <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`transform transition-all duration-300 ${isHovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow-brand">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="font-display text-lg font-bold text-content mb-2 group-hover:text-brand transition-colors duration-300 line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-content-secondary text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
            {course.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-content-muted mb-4">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span className="text-content-secondary font-medium">{course.chapter_count || 0}</span>
              <span>chapters</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{course.duration || 'Self-paced'}</span>
            </span>
          </div>

          {/* Progress or CTA */}
          {enrollment ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-content-muted">Your Progress</span>
                <span className={`font-display font-bold ${isCompleted ? 'text-accent-emerald' : 'text-accent-cyan'}`}>
                  {progress}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-gradient-fresh' : 'bg-gradient-brand'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isCompleted && (
                <div className="flex items-center justify-center gap-2 text-accent-emerald text-sm font-medium py-2 bg-accent-emerald/10 rounded-lg border border-accent-emerald/20">
                  <Award className="w-4 h-4" />
                  <span>Course Completed!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between pt-3 border-t border-line/5">
              <span className={`font-display text-lg font-bold ${isPro ? 'gradient-text' : 'text-accent-emerald'}`}>
                {isPro ? 'Pro' : 'Free'}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-content-secondary group-hover:text-brand transition-colors duration-300">
                Start Learning
                <ArrowUpRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
