import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import LessonDiscussions from '../components/LessonDiscussions';
import { ArrowLeft, CheckCircle, Play, Lock, ChevronLeft, ChevronRight, FileText, Bookmark, BookmarkCheck, Edit3 } from 'lucide-react';

const LessonPage = () => {
  const { courseId, moduleId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedModules, setCompletedModules] = useState(new Set());
  const [allModules, setAllModules] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasNote, setHasNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  const fetchData = useCallback(async () => {
    if (!courseId || !moduleId) return;

    setLoading(true);

    const [courseRes, chaptersRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase
        .from('chapters')
        .select(`
          *,
          modules (*)
        `)
        .eq('course_id', courseId)
        .order('order_index'),
    ]);

    setCourse(courseRes.data);
    
    const sortedChapters = (chaptersRes.data || []).map(ch => ({
      ...ch,
      modules: (ch.modules || []).sort((a, b) => a.order_index - b.order_index),
    })).sort((a, b) => a.order_index - b.order_index);
    
    setChapters(sortedChapters);

    const flatModules = sortedChapters.flatMap(ch => 
      ch.modules.map(m => ({ ...m, chapterId: ch.id, isFree: ch.is_free }))
    );
    setAllModules(flatModules);

    const currentMod = flatModules.find(m => m.id === moduleId);
    setCurrentModule(currentMod);

    if (user) {
      const [{ data: enrollData }, { data: progressData }] = await Promise.all([
        supabase.from('enrollments').select('*').eq('user_id', user.id).eq('course_id', courseId).single(),
        supabase.from('progress').select('module_id').eq('user_id', user.id).eq('completed', true)
      ]);
      
      setEnrollment(enrollData);
      setCompletedModules(new Set(progressData?.map(p => p.module_id) || []));

      // Check bookmark status
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();
      setIsBookmarked(!!bookmarkData);

      // Check for notes
      const { data: noteData } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();
      if (noteData) {
        setHasNote(true);
        setNoteContent(noteData.content);
      }
    }

    setLoading(false);
  }, [courseId, moduleId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isModuleAccessible = (module) => {
    if (!user) return false;
    if (enrollment) return true;
    return module.isFree;
  };

  const handlePrevious = () => {
    const currentIndex = allModules.findIndex(m => m.id === moduleId);
    if (currentIndex > 0) {
      const prevModule = allModules[currentIndex - 1];
      if (isModuleAccessible(prevModule)) {
        navigate(`/courses/${courseId}/module/${prevModule.id}`);
      }
    }
  };

  const handleNext = () => {
    const currentIndex = allModules.findIndex(m => m.id === moduleId);
    if (currentIndex < allModules.length - 1) {
      const nextModule = allModules[currentIndex + 1];
      if (isModuleAccessible(nextModule)) {
        navigate(`/courses/${courseId}/module/${nextModule.id}`);
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!user || completedModules.has(moduleId)) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('progress').upsert({
      user_id: user.id,
      module_id: moduleId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,module_id',
    });

    if (!error) {
      const newCompleted = new Set([...completedModules, moduleId]);
      setCompletedModules(newCompleted);
      setShowCompletionAnimation(true);
      await updateCourseProgress(newCompleted);
      setTimeout(() => setShowCompletionAnimation(false), 3000);
    }
    setIsSubmitting(false);
  };

  const updateCourseProgress = async (completedSet) => {
    if (!user || !courseId) return;

    const totalModules = allModules.length;
    const completed = completedSet.size;
    const progress = Math.round((completed / totalModules) * 100);

    await supabase
      .from('enrollments')
      .update({ progress })
      .eq('user_id', user.id)
      .eq('course_id', courseId);
  };

  const toggleBookmark = async () => {
    if (!user) return;

    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId);
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, module_id: moduleId });
    }
    setIsBookmarked(!isBookmarked);
  };

  const saveNote = async () => {
    if (!user) return;

    await supabase
      .from('notes')
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        content: noteContent,
      }, {
        onConflict: 'user_id,module_id'
      });
    
    setHasNote(!!noteContent.trim());
    setShowNoteEditor(false);
  };

  const currentIndex = allModules.findIndex(m => m.id === moduleId);
  const hasPrevious = currentIndex > 0 && isModuleAccessible(allModules[currentIndex - 1]);
  const hasNext = currentIndex < allModules.length - 1 && isModuleAccessible(allModules[currentIndex + 1]);
  const isCompleted = completedModules.has(moduleId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-base">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-base">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-2">Module Not Found</h2>
          <Link to={`/courses/${courseId}`} className="text-violet-400 hover:text-cyan-400">
            Back to Course →
          </Link>
        </div>
      </div>
    );
  }

  if (!isModuleAccessible(currentModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4 bg-base">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Content Locked</h1>
          <p className="text-slate-400 mb-6">This module requires enrollment. Sign up for free to access all course content.</p>
          <div className="flex flex-col gap-3">
            {!user && (
              <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-xl transition-colors">
                Sign In
              </Link>
            )}
            <Link to={`/courses/${courseId}`} className="px-6 py-3 bg-white/[0.03] border border-white/[0.06] text-white font-semibold rounded-xl transition-colors">
              View Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const videoUrl = currentModule.video_url;
  const isYoutube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');

  return (
    <div className="min-h-screen bg-base pt-16">
      <style>{`
        @keyframes completion-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .completion-animation {
          animation: completion-pulse 0.5s ease-in-out;
        }
      `}</style>

      {/* Completion Animation Overlay */}
      {showCompletionAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="completion-animation bg-gradient-to-r from-emerald-500 to-teal-500 p-8 rounded-3xl shadow-2xl text-center">
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-white mb-2">Module Completed!</h2>
            <p className="text-white/80">Great job! Keep up the momentum.</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl">
              {isYoutube ? (
                <iframe
                  src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                  title={currentModule.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full" autoPlay />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-[#0B0F17]">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">Video coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Module Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-2">{currentModule.title}</h1>
                <p className="text-slate-400">{currentModule.chapter?.title} • {currentModule.duration || '10 min'}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Bookmark */}
                {user && (
                  <button
                    onClick={toggleBookmark}
                    className={`p-2.5 rounded-xl border transition-all duration-300 ${
                      isBookmarked 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this module'}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                )}

                {/* Download Notes */}
                {currentModule.pdf_url && (
                  <a
                    href={currentModule.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30 font-medium rounded-xl transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    Download Notes
                  </a>
                )}

                {/* Mark Complete */}
                {!isCompleted ? (
                  <button
                    onClick={handleMarkComplete}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isSubmitting ? 'Marking...' : 'Mark Complete'}
                  </button>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 font-medium rounded-xl">
                    <CheckCircle className="w-5 h-5" />
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Notes Section */}
            {user && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Edit3 className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-display text-lg font-semibold text-white">Your Notes</h3>
                    {hasNote && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Saved</span>}
                  </div>
                  <button
                    onClick={() => setShowNoteEditor(!showNoteEditor)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showNoteEditor ? 'Cancel' : hasNote ? 'Edit Notes' : 'Take Notes'}
                  </button>
                </div>
                
                {showNoteEditor ? (
                  <div className="space-y-3">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write your notes here..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-violet-500/50 focus:outline-none resize-none"
                      rows={5}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={saveNote}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium rounded-lg hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300"
                      >
                        Save Notes
                      </button>
                      <button
                        onClick={() => {
                          setShowNoteEditor(false);
                          setNoteContent(hasNote ? noteContent : '');
                        }}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : hasNote ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 whitespace-pre-wrap">{noteContent}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No notes yet. Click &quot;Take Notes&quot; to add your thoughts.</p>
                )}
              </div>
            )}

            {/* Discussions Section */}
            <LessonDiscussions moduleId={moduleId} user={user} />
          </div>

          {/* Sidebar - Course Content */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
            <h2 className="font-display text-lg font-semibold text-white mb-4">Course Content</h2>
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter.id}>
                  <div className="text-sm font-medium text-slate-400 px-2 py-1 mb-1">
                    {chapter.order_index}. {chapter.title}
                  </div>
                  <div className="space-y-1">
                    {chapter.modules.map((module) => {
                      const isActive = module.id === moduleId;
                      const isModCompleted = completedModules.has(module.id);
                      const accessible = isModuleAccessible(module);

                      return (
                        <Link
                          key={module.id}
                          to={accessible ? `/courses/${courseId}/module/${module.id}` : '#'}
                          onClick={(e) => !accessible && e.preventDefault()}
                          className={`block px-3 py-2 rounded-lg transition-all ${
                            isActive
                              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                              : accessible
                              ? 'text-slate-300 hover:bg-white/5'
                              : 'text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isModCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : accessible ? (
                              <Play className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="text-sm truncate">{module.title}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              hasPrevious
                ? 'text-slate-300 hover:bg-white/5 border border-white/10 hover:border-violet-500/30'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <span className="text-slate-500 text-sm">
            {currentIndex + 1} of {allModules.length}
          </span>
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              hasNext
                ? 'text-slate-300 hover:bg-white/5 border border-white/10 hover:border-violet-500/30'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
