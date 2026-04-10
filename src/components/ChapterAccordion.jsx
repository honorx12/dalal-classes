// src/components/ChapterAccordion.jsx
import { useState } from 'react';
import { ChevronDown, Lock, CheckCircle, Play } from 'lucide-react';
import ModuleItem from './ModuleItem';

const ChapterAccordion = ({ chapter, isLocked, onChapterClick, courseId, isEnrolled, userId }) => {
  const [isOpen, setIsOpen] = useState(chapter.order_index <= 3);

  const modules = chapter.modules || [];
  const completedCount = modules.filter(m => 
    m.progress?.some(p => p.completed)
  ).length;

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => {
          if (isLocked && !chapter.is_free) {
            onChapterClick?.(chapter);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${
          isLocked && !chapter.is_free ? 'cursor-pointer' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isLocked && !chapter.is_free && !isEnrolled
              ? 'bg-slate-200 text-slate-500'
              : completedCount === modules.length && modules.length > 0
              ? 'bg-green-100 text-green-600'
              : 'bg-amber-100 text-amber-600'
          }`}>
            {isLocked && !chapter.is_free && !isEnrolled ? (
              <Lock className="w-4 h-4" />
            ) : completedCount === modules.length && modules.length > 0 ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              chapter.order_index
            )}
          </div>
          <div className="text-left">
            <h3 className={`font-medium ${
              isLocked && !chapter.is_free && !isEnrolled
                ? 'text-slate-500'
                : 'text-slate-900'
            }`}>
              {chapter.title}
            </h3>
            <p className="text-sm text-slate-500">
              {modules.length} modules
              {completedCount > 0 && ` • ${completedCount} completed`}
              {chapter.is_free && !isEnrolled && (
                <span className="ml-2 text-amber-600 font-medium">FREE</span>
              )}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 ml-11 space-y-2 animate-slide-up">
          {modules
            .sort((a, b) => a.order_index - b.order_index)
            .map((module) => (
              <ModuleItem
                key={module.id}
                module={module}
                isLocked={isLocked && !chapter.is_free}
                isCompleted={module.progress?.some(p => p.completed)}
                onLockedClick={() => onChapterClick?.(chapter)}
                courseId={courseId}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ChapterAccordion;
