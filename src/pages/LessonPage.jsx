// src/pages/LessonPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, ArrowRight, CheckCircle, Play, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

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
      if (isModuleAccessible(prevModule) || user) {
        navigate(`/courses/${courseId}/module/${prevModule.id}`);
      }
    }
  };

  const handleNext = () => {
    const currentIndex = allModules.findIndex(m => m.id === moduleId);
    if (currentIndex < allModules.length - 1) {
      const nextModule = allModules[currentIndex + 1];
      if (isModuleAccessible(nextModule) || user) {
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
      setCompletedModules(new Set([...completedModules, moduleId]));
      await updateCourseProgress();
    }
  };

  const updateCourseProgress = async () => {
    if (!user || !courseId) return;

    const totalModules = allModules.length;
    const completed = completedModules.size + 1;
    const progress = Math.round((completed / totalModules) * 100);

    await supabase.from('enrollments').update({ progress }).eq('user_id', user.id).eq('course_id', courseId);
  };

  const currentIndex = allModules.findIndex(m => m.id === moduleId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allModules.length - 1;
  const isCompleted = completedModules.has(moduleId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-slate-600">Module not found</p>
      </div>
    );
  }

  if (!isModuleAccessible(currentModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Content Locked
          </h1>
          <p className="text-slate-600 mb-6">
            This module requires enrollment. Sign up to preview free chapters or purchase the course.
          </p>
          <div className="flex flex-col gap-3">
            {!user && (
              <Link
                to="/login"
                className="px-6 py-3 bg-navy hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              to={`/courses/${courseId}`}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-colors"
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
    <div className="min-h-screen bg-slate-900 pt-16">
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
                <div className="w-full h-full flex items-center justify-center">
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
                  {currentModule.chapter?.title} • {currentModule.duration}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isCompleted && (
                  <button
                    onClick={handleMarkComplete}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark Complete
                  </button>
                )}
                {isCompleted && (
                  <span className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 font-medium rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">Course Content</h2>
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <div key={chapter.id}>
                  <div className="text-sm font-medium text-slate-400 px-2 py-1">
                    {chapter.title}
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
                          className={`block px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-400'
                              : accessible
                              ? 'text-slate-300 hover:bg-slate-700'
                              : 'text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isModCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
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

        <div className="mt-8 flex items-center justify-between border-t border-slate-700 pt-6">
          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasPrevious
                ? 'text-slate-300 hover:bg-slate-800'
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasNext
                ? 'text-slate-300 hover:bg-slate-800'
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
