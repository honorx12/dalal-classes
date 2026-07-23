import { Link } from 'react-router-dom';
import { Lock, Play, CheckCircle } from 'lucide-react';

const ModuleItem = ({ module, isEnrolled, courseId }) => {
  const isCompleted = module.is_completed;
  const isLocked = !isEnrolled && !module.is_free;

  const content = (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
      isLocked
        ? 'bg-base/50 cursor-not-allowed opacity-60'
        : isCompleted
        ? 'bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20'
        : 'bg-elevated/50 cursor-pointer hover:bg-surface-raised border border-line/20 hover:border-brand/30'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isCompleted
          ? 'bg-emerald-500 text-white'
          : isLocked
          ? 'bg-base text-slate-500'
          : 'bg-brand text-white'
      }`}>
        {isCompleted ? (
          <CheckCircle className="w-4 h-4" />
        ) : isLocked ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className={`text-sm font-medium truncate ${
          isLocked ? 'text-slate-500' : 'text-white'
        }`}>
          {module.title}
        </p>
        <p className={`text-xs ${
          isLocked ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {module.duration || '10 min'}
        </p>
      </div>
      {isCompleted && (
        <span className="text-xs text-emerald-400 font-medium">
          Done
        </span>
      )}
    </div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link to={`/courses/${courseId}/module/${module.id}`}>
      {content}
    </Link>
  );
};

export default ModuleItem;
