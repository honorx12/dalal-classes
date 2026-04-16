import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, CheckCircle, Play, Lock, ChevronLeft, ChevronRight, FileQuestion } from 'lucide-react';

const LessonPage = () => {
  const { courseId, moduleId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedModules, setCompletedModules] = useState(new Set());
  const [allModules, setAllModules] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !moduleId) return;

      setLoading(true);

      const [courseRes, chaptersRes, moduleRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase
          .from('chapters')
          .select(`
            *,
            modules (*)
          `)
          .eq('course_id', courseId)
          .order('order_index'),
        supabase
          .from('modules')
          .select('*, chapter:chapters(*)')
          .eq('id', moduleId)
          .single(),
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
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
        setEnrollment(enrollData);

        const { data: progressData } = await supabase
          .from('progress')
          .select('module_id')
          .eq('user_id', user.id)
          .eq('completed', true);
        
        setCompletedModules(new Set(progressData?.map(p => p.module_id) || []));
      }

      setLoading(false);
    };

    fetchData();
  }, [courseId, moduleId, user]);

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
      await updateCourseProgress(newCompleted);
    }
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

  const currentIndex = allModules.findIndex(m => m.id === moduleId);
  const hasPrevious = currentIndex > 0 && isModuleAccessible(allModules[currentIndex - 1]);
  const hasNext = currentIndex < allModules.length - 1 && isModuleAccessible(allModules[currentIndex + 1]);
  const isCompleted = completedModules.has(moduleId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Module Not Found</h2>
          <Link to={`/courses/${courseId}`} className="text-accent-violet hover:text-accent-cyan">
            Back to Course →
          </Link>
        </div>
      </div>
    );
  }

  if (!isModuleAccessible(currentModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-dark-card/60 backdrop-blur-sm border border-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Content Locked
          </h1>
          <p className="text-slate-400 mb-6">
            This module requires enrollment. Sign up for free to access all course content.
          </p>
          <div className="flex flex-col gap-3">
            {!user && (
              <Link
                to="/login"
                className="px-6 py-3 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              to={`/courses/${courseId}`}
              className="px-6 py-3 bg-dark-card/60 backdrop-blur-sm border border-dark-border text-white font-semibold rounded-xl transition-colors"
            >
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
    <div className="min-h-screen bg-dark-bg pt-16">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl overflow-hidden aspect-video">
              {isYoutube ? (
                <iframe
                  src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                  title={currentModule.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-card to-dark-bg">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">Video coming soon</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {currentModule.title}
                </h1>
                <p className="text-slate-400">
                  {currentModule.chapter?.title} • {currentModule.duration || '10 min'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isCompleted ? (
                  <button
                    onClick={handleMarkComplete}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark Complete
                  </button>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 font-medium rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-dark-card/60 backdrop-blur-xl border border-dark-border rounded-2xl p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">Course Content</h2>
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
                              ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30'
                              : accessible
                              ? 'text-slate-300 hover:bg-dark-bg'
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

        <div className="mt-8 flex items-center justify-between border-t border-dark-border pt-6">
          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              hasPrevious
                ? 'text-slate-300 hover:bg-dark-card border border-dark-border hover:border-accent-violet/50'
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              hasNext
                ? 'text-slate-300 hover:bg-dark-card border border-dark-border hover:border-accent-violet/50'
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
