import { useState } from 'react';
import { ChevronDown, Lock, CheckCircle, FileQuestion } from 'lucide-react';
import ModuleItem from './ModuleItem';

const ChapterAccordion = ({ chapter, courseId, isEnrolled, userId, onQuizClick, allModulesCompleted }) => {
  const [isOpen, setIsOpen] = useState(chapter.order_index <= 1);

  const modules = chapter.modules || [];
  const completedCount = modules.filter(m => m.is_completed).length;
  const hasQuiz = chapter.has_quiz;
  const quizPassed = chapter.quiz_passed;
  const allChapterModulesCompleted = completedCount === modules.length && modules.length > 0;
  const canTakeQuiz = allChapterModulesCompleted && hasQuiz && !quizPassed;
  const showQuizButton = allChapterModulesCompleted && hasQuiz;

  return (
    <div className="border border-dark-border rounded-xl overflow-hidden bg-dark-card/40 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-card/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
            allChapterModulesCompleted && quizPassed
              ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
              : allChapterModulesCompleted
              ? 'bg-accent-cyan/20 text-accent-cyan border-2 border-accent-cyan'
              : 'bg-dark-bg text-slate-400 border-2 border-slate-600'
          }`}>
            {allChapterModulesCompleted && quizPassed ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              chapter.order_index
            )}
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white">
              {chapter.title}
            </h3>
            <p className="text-sm text-slate-400">
              {modules.length} modules
              {completedCount > 0 && ` • ${completedCount} completed`}
              {quizPassed && (
                <span className="ml-2 text-emerald-400 font-medium">Quiz Passed</span>
              )}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 ml-13 space-y-2 animate-slide-up">
          {modules
            .sort((a, b) => a.order_index - b.order_index)
            .map((module) => (
              <ModuleItem
                key={module.id}
                module={module}
                isEnrolled={isEnrolled}
                courseId={courseId}
              />
            ))}
          
          {showQuizButton && (
            <button
              onClick={() => onQuizClick?.(chapter)}
              className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-accent-violet/20 to-accent-cyan/20 border border-accent-violet/30 text-accent-violet hover:from-accent-violet/30 hover:to-accent-cyan/30 transition-all font-medium"
            >
              <FileQuestion className="w-5 h-5" />
              Take Chapter Quiz
            </button>
          )}
          
          {quizPassed && (
            <div className="mt-3 flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Chapter Completed!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterAccordion;
