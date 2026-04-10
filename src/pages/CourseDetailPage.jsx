// src/pages/CourseDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import ChapterAccordion from '../components/ChapterAccordion';
import PaymentModal from '../components/PaymentModal';
import { ArrowLeft, Clock, BookOpen, Users, Award, Play } from 'lucide-react';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lockedChapter, setLockedChapter] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      const [courseRes, chaptersRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase
          .from('chapters')
          .select(`
            *,
            modules (
              *,
              progress (
                completed
              )
            )
          `)
          .eq('course_id', courseId)
          .order('order_index'),
      ]);

      setCourse(courseRes.data);
      setChapters(chaptersRes.data || []);

      if (user) {
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
        setEnrollment(enrollData);
      }

      setLoading(false);
    };

    fetchData();
  }, [courseId, user]);

  const handleChapterClick = async (chapter) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (chapter.is_free || enrollment) {
      return;
    }

    setLockedChapter(chapter);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setEnrollment({ course_id: courseId, progress: 0 });
    setShowPaymentModal(false);
    setLockedChapter(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-slate-600">Course not found</p>
      </div>
    );
  }

  const isEnrolled = !!enrollment;

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className={`h-64 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-8 relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-9xl font-bold opacity-20">
              {course.title.charAt(0)}
            </span>
          </div>
          <div className="relative text-center text-white p-8">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4 inline-block">
              {course.level}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              {course.description}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl text-center">
            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">Duration</p>
            <p className="font-semibold text-slate-900">{course.duration || 'Self-paced'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <BookOpen className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">Chapters</p>
            <p className="font-semibold text-slate-900">{chapters.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">Certificate</p>
            <p className="font-semibold text-slate-900">Included</p>
          </div>
        </div>

        {!isEnrolled ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Unlock Full Course
            </h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              Get access to all chapters and modules. Preview first 3 chapters for free!
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-bold text-navy">₹{course.price}</span>
              <button
                onClick={() => {
                  if (!user) navigate('/login');
                  else {
                    setLockedChapter({ title: 'Full Course' });
                    setShowPaymentModal(true);
                  }
                }}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              >
                Enroll Now
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Secure payment with Razorpay
            </p>
          </div>
        ) : (
          <div className="bg-green-50 rounded-2xl p-6 text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">You're Enrolled!</span>
            </div>
            <p className="text-green-600">
              Continue learning from where you left off
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Course Content</h2>
          {chapters.map((chapter, index) => (
            <ChapterAccordion
              key={chapter.id}
              chapter={chapter}
              isLocked={!chapter.is_free && !isEnrolled}
              onChapterClick={handleChapterClick}
              courseId={courseId}
              isEnrolled={isEnrolled}
              userId={user?.id}
            />
          ))}
        </div>

        {chapters.length > 0 && (
          <div className="mt-8 bg-slate-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Ready to Start Learning?
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {isEnrolled
                    ? 'Continue to the first available chapter'
                    : 'Sign up to preview chapters 1-3 for free'}
                </p>
                {!user && (
                  <Link
                    to="/signup"
                    className="text-amber-600 font-semibold text-sm hover:text-amber-700"
                  >
                    Create free account →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showPaymentModal && course && (
        <PaymentModal
          course={course}
          onClose={() => {
            setShowPaymentModal(false);
            setLockedChapter(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
