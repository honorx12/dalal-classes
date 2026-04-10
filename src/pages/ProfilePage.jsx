// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { LogOut, User, BookOpen, Award, Clock } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';

const ProfilePage = () => {
  const { user, profile, logout, loading: authLoading } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            *
          )
        `)
        .eq('user_id', user.id);
      
      setEnrollments(data || []);
      setLoading(false);
    };

    fetchEnrollments();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="hero-gradient p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </h1>
                <p className="text-slate-300">{user?.email}</p>
                <p className="text-amber-300 text-sm mt-2">
                  Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="md:ml-auto flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 p-8">
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{enrollments.length}</p>
              <p className="text-slate-600">Enrolled Courses</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalProgress}%</p>
              <p className="text-slate-600">Average Progress</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {enrollments.filter(e => e.progress === 100).length}
              </p>
              <p className="text-slate-600">Completed</p>
            </div>
          </div>
        </div>

        {enrollments.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map(enrollment => (
                <div key={enrollment.id}>
                  <CourseCard
                    course={enrollment.courses}
                    enrollment={enrollment}
                  />
                  {enrollment.progress < 100 && (
                    <div className="mt-2 px-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Your Progress</span>
                        <span className="font-medium text-slate-900">{enrollment.progress}%</span>
                      </div>
                      <ProgressBar progress={enrollment.progress} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Courses Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Start learning by enrolling in a course
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-colors"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
