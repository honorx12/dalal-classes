import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import ChapterAccordion from '../components/ChapterAccordion';
import QuizModal from '../components/QuizModal';
import CertificateModal from '../components/CertificateModal';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, Clock, BookOpen, Award, Users, Play, CheckCircle, Lock } from 'lucide-react';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      setLoading(true);

      const [courseRes, chaptersRes, quizRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase
          .from('chapters')
          .select(`
            *,
            modules (
              *,
              progress (completed)
            ),
            quizzes (id)
          `)
          .eq('course_id', courseId)
          .order('order_index'),
        supabase.from('quizzes').select('chapter_id').eq('course_id', courseId),
      ]);

      setCourse(courseRes.data);

      const quizChapters = new Set(quizRes.data?.map(q => q.chapter_id) || []);
      
      const chaptersWithProgress = (chaptersRes.data || []).map(chapter => {
        const modulesWithProgress = (chapter.modules || []).map(mod => ({
          ...mod,
          is_completed: mod.progress?.some(p => p.completed) || false,
          is_free: chapter.is_free,
        }));

        return {
          ...chapter,
          modules: modulesWithProgress,
          has_quiz: quizChapters.has(chapter.id),
          quiz_passed: false,
        };
      });

      setChapters(chaptersWithProgress);

      if (user) {
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
        setEnrollment(enrollData);

        if (enrollData) {
          await checkChapterQuizzes(user.id, chaptersWithProgress);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [courseId, user]);

  const checkChapterQuizzes = async (userId, chaptersData) => {
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('chapter_id, passed')
      .eq('user_id', userId)
      .eq('passed', true);

    const passedChapters = new Set(attempts?.map(a => a.chapter_id) || []);
    
    setChapters(prev => prev.map(ch => ({
      ...ch,
      quiz_passed: passedChapters.has(ch.id),
    })));
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    setEnrolling(true);
    try {
      await supabase.from('enrollments').upsert({
        user_id: user.id,
        course_id: courseId,
        progress: 0,
      }, {
        onConflict: 'user_id,course_id',
      });

      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      setEnrollment(enrollData);
    } catch (err) {
      console.error('Enrollment failed:', err);
    }
    setEnrolling(false);
  };

  const handleQuizComplete = async () => {
    if (user) {
      await checkChapterQuizzes(user.id, chapters);
    }
    checkCourseCompletion();
  };

  const checkCourseCompletion = () => {
    if (!enrollment || chapters.length === 0) return;

    const allChaptersComplete = chapters.every(ch => {
      const allModulesDone = ch.modules.every(m => m.is_completed);
      const quizPassed = !ch.has_quiz || ch.quiz_passed;
      return allModulesDone && quizPassed;
    });

    if (allChaptersComplete) {
      setShowCertificate(true);
    }
  };

  const allModulesComplete = chapters.every(ch => 
    ch.modules.every(m => m.is_completed)
  );

  const allQuizzesPassed = chapters
    .filter(ch => ch.has_quiz)
    .every(ch => ch.quiz_passed);

  const canGetCertificate = enrollment && allModulesComplete && 
    (chapters.filter(ch => ch.has_quiz).length === 0 || allQuizzesPassed);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-slate-400 mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="text-accent-violet hover:text-accent-cyan">
            Browse All Courses →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className={`rounded-2xl bg-gradient-to-br ${course.gradient || 'from-accent-violet to-accent-cyan'} p-8 mb-8 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-4 inline-block">
              {course.level || 'Beginner'}
            </span>
            <span className="ml-2 px-3 py-1 bg-emerald-500/80 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
              FREE
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-2">{course.title}</h1>
            <p className="text-white/80 text-lg max-w-2xl">
              {course.description}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-card/40 backdrop-blur-sm border border-dark-border p-4 rounded-xl text-center">
            <Clock className="w-6 h-6 text-accent-violet mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Duration</p>
            <p className="font-semibold text-white">{course.duration || 'Self-paced'}</p>
          </div>
          <div className="bg-dark-card/40 backdrop-blur-sm border border-dark-border p-4 rounded-xl text-center">
            <BookOpen className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Chapters</p>
            <p className="font-semibold text-white">{chapters.length}</p>
          </div>
          <div className="bg-dark-card/40 backdrop-blur-sm border border-dark-border p-4 rounded-xl text-center">
            <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Certificate</p>
            <p className="font-semibold text-white">Included</p>
          </div>
        </div>

        {enrollment ? (
          <div className="bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">You're Enrolled!</span>
              </div>
              {canGetCertificate && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all"
                >
                  <Award className="w-5 h-5" />
                  Get Certificate
                </button>
              )}
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Course Progress</span>
                <span className="text-accent-cyan">{enrollment.progress || 0}%</span>
              </div>
              <ProgressBar progress={enrollment.progress || 0} />
            </div>
            <p className="text-sm text-slate-400">
              {allModulesComplete 
                ? 'All modules completed!' 
                : 'Continue learning from where you left off'}
              {allModulesComplete && !allQuizzesPassed && chapters.some(ch => ch.has_quiz) && (
                <span className="text-amber-400"> Complete all quizzes to get your certificate.</span>
              )}
            </p>
          </div>
        ) : (
          <div className="bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl p-8 text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Start Learning for Free
            </h2>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              Enroll now to get instant access to all chapters and modules. No payment required!
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-8 py-4 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
            </button>
            <p className="text-sm text-slate-500 mt-4">
              {user ? 'Click to unlock all content' : 'Sign in to enroll in this course'}
            </p>
          </div>
        )}

        <div className="bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Course Content</h2>
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <ChapterAccordion
                key={chapter.id}
                chapter={chapter}
                courseId={courseId}
                isEnrolled={!!enrollment}
                userId={user?.id}
                onQuizClick={(ch) => setShowQuiz(ch)}
              />
            ))}
          </div>
        </div>

        {chapters.length > 0 && !enrollment && (
          <div className="mt-8 bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-full flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Ready to Start Learning?
                </h3>
                <p className="text-slate-400 text-sm mb-3">
                  Sign up for free to enroll in this course and start learning
                </p>
                {!user && (
                  <Link
                    to="/signup"
                    className="text-accent-violet font-semibold text-sm hover:text-accent-cyan"
                  >
                    Create free account →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showQuiz && (
        <QuizModal
          chapter={showQuiz}
          courseId={courseId}
          onClose={() => setShowQuiz(null)}
          onComplete={handleQuizComplete}
        />
      )}

      {showCertificate && course && (
        <CertificateModal
          course={course}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
