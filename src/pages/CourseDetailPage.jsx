import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import ChapterAccordion from '../components/ChapterAccordion';
import QuizModal from '../components/QuizModal';
import CertificateModal from '../components/CertificateModal';
import ProgressBar from '../components/ProgressBar';
import CourseReviews from '../components/CourseReviews';
import UpgradeModal from '../components/UpgradeModal';
import PlanBadge from '../components/PlanBadge';
import { ArrowLeft, Clock, BookOpen, Award, Play, CheckCircle, Star } from 'lucide-react';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { user } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

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

      // Fetch reviews stats
      const { data: reviewsData } = await supabase
        .from('course_reviews')
        .select('rating')
        .eq('course_id', courseId);
      
      if (reviewsData && reviewsData.length > 0) {
        const avg = reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length;
        setAverageRating(avg.toFixed(1));
        setReviewCount(reviewsData.length);
      }

      setLoading(false);
    };

    fetchData();
  }, [courseId, user]);

  const checkChapterQuizzes = async (userId, _chaptersData) => {
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
      window.location.href = `/login?redirect=/courses/${courseId}`;
      return;
    }

    // Pro course + free user => upsell instead of enrolling
    if ((course?.price || 0) > 0 && !useSubscriptionStore.getState().isPro()) {
      setShowUpgrade(true);
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
      <div className="min-h-screen flex items-center justify-center pt-16 bg-base">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-base">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-content mb-2">Course Not Found</h2>
          <p className="text-content-secondary mb-4">The course you are looking for does not exist.</p>
          <Link to="/courses" className="text-brand hover:text-accent-cyan">
            Browse All Courses →
          </Link>
        </div>
      </div>
    );
  }

  const isProCourse = (course.price || 0) > 0;

  return (
    <div className="min-h-screen bg-base pt-16">
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Link */}
          <Link to="/courses" className="inline-flex items-center gap-2 text-content-muted hover:text-content mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          {/* Hero Card */}
          <div className={`rounded-3xl bg-gradient-to-br ${course.gradient || 'from-violet-600 to-cyan-500'} p-8 mb-8 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                  {course.level || 'Beginner'}
                </span>
                <PlanBadge plan={isProCourse ? 'pro' : 'free'} />
                {reviewCount > 0 && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {averageRating} ({reviewCount} reviews)
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-4 mb-4">{course.title}</h1>
              <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="stats-card text-center hover:border-brand/30">
              <Clock className="w-6 h-6 text-brand mx-auto mb-2" />
              <p className="text-content-muted text-sm mb-1">Duration</p>
              <p className="font-display font-semibold text-content">{course.duration || 'Self-paced'}</p>
            </div>
            <div className="stats-card text-center hover:border-accent-cyan/30">
              <BookOpen className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
              <p className="text-content-muted text-sm mb-1">Chapters</p>
              <p className="font-display font-semibold text-content">{chapters.length}</p>
            </div>
            <div className="stats-card text-center hover:border-accent-amber/30">
              <Award className="w-6 h-6 text-accent-amber mx-auto mb-2" />
              <p className="text-content-muted text-sm mb-1">Certificate</p>
              <p className="font-display font-semibold text-content">Included</p>
            </div>
          </div>

          {/* Enrollment Status */}
          {enrollment ? (
            <div className="card-raised p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-accent-emerald">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-display font-semibold">You are Enrolled!</span>
                </div>
                {canGetCertificate && (
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="btn-primary flex items-center gap-2 px-4 py-2"
                  >
                    <Award className="w-5 h-5" />
                    Get Certificate
                  </button>
                )}
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-content-muted">Course Progress</span>
                  <span className="text-accent-cyan font-medium">{enrollment.progress || 0}%</span>
                </div>
                <ProgressBar progress={enrollment.progress || 0} />
              </div>
              <p className="text-sm text-content-muted">
                {allModulesComplete
                  ? 'All modules completed!'
                  : 'Continue learning from where you left off'}
                {allModulesComplete && !allQuizzesPassed && chapters.some(ch => ch.has_quiz) && (
                  <span className="text-accent-amber"> Complete all quizzes to get your certificate.</span>
                )}
              </p>
            </div>
          ) : (
            <div className={`${isProCourse ? 'animated-border' : ''} rounded-2xl mb-8`}>
              <div className="card-raised p-8 text-center">
                <h2 className="font-display text-2xl font-bold text-content mb-4">
                  {isProCourse ? 'Included in the Pro plan' : 'Start Learning for Free'}
                </h2>
                <p className="text-content-secondary mb-6 max-w-lg mx-auto">
                  {isProCourse
                    ? 'This course is part of Pro. Upgrade once, unlock every Pro course on the platform.'
                    : 'Enroll now to get instant access to all chapters and modules. No payment required!'}
                </p>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary px-8 py-4 disabled:opacity-50 font-display"
                >
                  {enrolling ? 'Enrolling...' : isProCourse ? 'Unlock with Pro' : 'Enroll Now — Free'}
                </button>
                <p className="text-sm text-content-muted mt-4">
                  {user ? (isProCourse ? 'Free chapters available to preview below' : 'Click to unlock all content') : 'Sign in to enroll in this course'}
                </p>
              </div>
            </div>
          )}

          {/* Course Content */}
          <div className="card-raised p-6 mb-8">
            <h2 className="font-display text-xl font-bold text-content mb-6">Course Content</h2>
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

          {/* Reviews Section */}
          <div className="card-raised p-6 mb-8">
            <h2 className="font-display text-xl font-bold text-content mb-6">Student Reviews</h2>
            <CourseReviews courseId={courseId} user={user} />
          </div>

          {/* CTA */}
          {chapters.length > 0 && !enrollment && (
            <div className="card-raised p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-content mb-1">Ready to Start Learning?</h3>
                  <p className="text-content-secondary text-sm mb-3">Sign up for free to enroll in this course and start learning</p>
                  {!user && (
                    <Link to="/signup" className="text-brand font-semibold text-sm hover:text-accent-cyan transition-colors">
                      Create free account →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        courseTitle={course?.title}
      />
    </div>
  );
};

export default CourseDetailPage;
