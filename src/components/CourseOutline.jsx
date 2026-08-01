import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Search, CheckCircle, FileQuestion, Play, Lock } from 'lucide-react';

const CourseOutline = ({
  chapters,
  courseId,
  activeModuleId,
  isEnrolled,
  collapsed,
  onToggleCollapse,
  onQuizClick,
  completedModules = new Set(),
}) => {
  const [query, setQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState(() => {
    // Expand first chapter by default
    const firstChapter = chapters?.[0];
    return firstChapter ? { [firstChapter.id]: true } : {};
  });

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const filteredChapters = useMemo(() => {
    if (!query.trim()) return chapters;
    const q = query.toLowerCase();
    return chapters
      .map((ch) => ({
        ...ch,
        modules: (ch.modules || []).filter((m) => m.title.toLowerCase().includes(q)),
      }))
      .filter((ch) => ch.title.toLowerCase().includes(q) || ch.modules.length > 0);
  }, [chapters, query]);

  // Calculate completion stats for a chapter
  const getChapterStats = (chapter) => {
    const modules = chapter.modules || [];
    const completedCount = modules.filter(m => completedModules.has(m.id) || m.is_completed).length;
    return { completedCount, total: modules.length };
  };

  // Calculate total course progress
  const getCourseProgress = () => {
    let totalModules = 0;
    let completedTotal = 0;
    chapters.forEach(ch => {
      const modules = ch.modules || [];
      totalModules += modules.length;
      completedTotal += modules.filter(m => completedModules.has(m.id) || m.is_completed).length;
    });
    return { completedTotal, totalModules, percentage: totalModules > 0 ? Math.round((completedTotal / totalModules) * 100) : 0 };
  };

  const courseProgress = getCourseProgress();

  // Collapsed view - icon-only rail
  if (collapsed) {
    return (
      <div className="w-16 flex flex-col items-center gap-3 py-4 bg-white/[0.02] border-r border-white/[0.06]">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Expand outline"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        <div className="w-full border-t border-white/[0.06] my-2" />

        {filteredChapters.map((chapter) => {
          const { completedCount, total } = getChapterStats(chapter);
          const isComplete = completedCount === total && total > 0;
          const hasQuiz = chapter.has_quiz;
          const quizPassed = chapter.quiz_passed;

          return (
            <div key={chapter.id} className="flex flex-col items-center gap-1">
              {/* Chapter indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isComplete && quizPassed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : isComplete
                    ? 'bg-brand/20 text-brand border border-brand/50'
                    : 'bg-white/5 text-slate-500 border border-white/10'
                }`}
                title={`${chapter.title} (${completedCount}/${total})`}
              >
                {isComplete && quizPassed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  chapter.order_index
                )}
              </div>

              {/* Module dots */}
              <div className="flex flex-col gap-1 mt-1">
                {(chapter.modules || []).slice(0, 5).map((module) => {
                  const isCompleted = completedModules.has(module.id) || module.is_completed;
                  const isActive = module.id === activeModuleId;

                  return (
                    <Link
                      key={module.id}
                      to={isEnrolled || module.is_free ? `/courses/${courseId}/module/${module.id}` : '#'}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        isActive
                          ? 'bg-brand'
                          : isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                      title={module.title}
                    />
                  );
                })}
                {(chapter.modules || []).length > 5 && (
                  <span className="text-[8px] text-slate-600 text-center">+</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Course Content</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full w-24">
              <div
                className="h-full bg-gradient-to-r from-brand to-accent-cyan rounded-full transition-all duration-300"
                style={{ width: `${courseProgress.percentage}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{courseProgress.percentage}%</span>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Collapse outline"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search course outline"
          className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:border-brand/50 focus:outline-none transition-colors"
        />
      </div>

      {/* Chapter tree */}
      <div className="space-y-2">
        {filteredChapters.map((chapter) => {
          const { completedCount, total } = getChapterStats(chapter);
          const isExpanded = expandedChapters[chapter.id] ?? false;
          const isComplete = completedCount === total && total > 0;
          const hasQuiz = chapter.has_quiz;
          const quizPassed = chapter.quiz_passed;
          const allModulesDone = isComplete;

          return (
            <div key={chapter.id} className="border-b border-white/[0.06] last:border-0 pb-2 last:pb-0">
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isComplete && quizPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                        : isComplete
                        ? 'bg-brand/20 text-brand border-2 border-brand'
                        : 'bg-white/5 text-slate-400 border-2 border-white/10'
                    }`}
                  >
                    {isComplete && quizPassed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      chapter.order_index
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm truncate">
                      {chapter.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-500">
                    {completedCount}/{total}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Modules and quiz */}
              {isExpanded && (
                <div className="ml-11 space-y-1 mt-1 animate-slide-up">
                  {(chapter.modules || [])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((module, idx) => {
                      const isCompleted = completedModules.has(module.id) || module.is_completed;
                      const isActive = module.id === activeModuleId;
                      const isLocked = !isEnrolled && !module.is_free;

                      return (
                        <Link
                          key={module.id}
                          to={isLocked ? '#' : `/courses/${courseId}/module/${module.id}`}
                          onClick={(e) => isLocked && e.preventDefault()}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-brand/20 border border-brand/30'
                              : isLocked
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isLocked
                                ? 'bg-white/5 text-slate-500'
                                : isActive
                                ? 'bg-brand text-white'
                                : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : isLocked ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 ml-0.5" />
                            )}
                          </div>
                          <span
                            className={`text-sm truncate flex-1 ${
                              isActive ? 'text-brand font-medium' : isLocked ? 'text-slate-500' : 'text-slate-300'
                            }`}
                          >
                            {idx + 1}. {module.title}
                          </span>
                        </Link>
                      );
                    })}

                  {/* Quiz row */}
                  {hasQuiz && (
                    <button
                      onClick={() => onQuizClick?.(chapter)}
                      disabled={!allModulesDone}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        quizPassed
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20'
                          : allModulesDone
                          ? 'hover:bg-white/[0.04]'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          quizPassed
                            ? 'bg-emerald-500 text-white'
                            : allModulesDone
                            ? 'bg-accent-amber text-white'
                            : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {quizPassed ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <FileQuestion className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span
                        className={`text-sm truncate flex-1 ${
                          quizPassed ? 'text-emerald-400' : allModulesDone ? 'text-accent-amber' : 'text-slate-500'
                        }`}
                      >
                        {quizPassed ? 'Quiz Completed' : allModulesDone ? 'Take Chapter Quiz' : 'Quiz Locked'}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseOutline;
