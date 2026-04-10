// src/components/ModuleItem.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Lock, Play, CheckCircle } from 'lucide-react';

const ModuleItem = ({ module, isLocked, isCompleted, onLockedClick, courseId }) => {
  const [shake, setShake] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      onLockedClick?.();
    }
  };

  const content = (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isLocked
          ? 'bg-slate-100 cursor-pointer hover:bg-slate-200'
          : 'bg-white cursor-pointer hover:bg-slate-50'
      } ${shake ? 'animate-shake' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isCompleted
          ? 'bg-green-500 text-white'
          : isLocked
          ? 'bg-slate-200 text-slate-400'
          : 'bg-amber-500 text-white'
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
          isLocked ? 'text-slate-500' : 'text-slate-900'
        }`}>
          {module.title}
        </p>
        <p className={`text-xs ${
          isLocked ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {module.duration}
        </p>
      </div>
      {isLocked && (
        <span className="text-xs text-slate-400 font-medium">
          Locked
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
