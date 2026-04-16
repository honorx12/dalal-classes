import { Link } from 'react-router-dom';
import { Clock, BookOpen, Award, Play } from 'lucide-react';

const CourseCard = ({ course, enrollment }) => {
  const progress = enrollment?.progress || 0;

  return (
    <Link to={`/courses/${course.id}`} className="block group">
      <div className="relative h-full rounded-2xl overflow-hidden bg-dark-card/60 backdrop-blur-xl border border-dark-border group-hover:border-accent-violet/50 transition-all duration-300 group-hover:shadow-glow hover:-translate-y-1">
        <div className={`h-40 relative overflow-hidden bg-gradient-to-br ${course.gradient || 'from-accent-violet to-accent-cyan'}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-5xl font-bold opacity-20">
              {course.title?.charAt(0) || 'C'}
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20">
              {course.level || 'Beginner'}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-emerald-400/30">
              FREE
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-cyan transition-colors">
            {course.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4 flex-grow line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.chapter_count || 0} Chapters
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration || 'Self-paced'}
            </span>
          </div>
          {enrollment ? (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Progress</span>
                <span className="font-medium text-accent-cyan">{progress}%</span>
              </div>
              <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <div className="mt-2 flex items-center gap-1 text-emerald-400 text-sm">
                  <Award className="w-4 h-4" />
                  Completed
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-400">
                FREE
              </span>
              <span className="flex items-center gap-1 text-accent-violet font-medium text-sm group-hover:text-accent-cyan transition-colors">
                View Course <Play className="w-4 h-4" />
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
