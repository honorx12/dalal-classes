import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { LogOut, User, BookOpen, Award, Clock, Edit2, Save, X } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';

const ProfilePage = () => {
  const { user, profile, logout, loading: authLoading, updateProfile } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            *,
            chapters(count)
          )
        `)
        .eq('user_id', user.id);
      
      const enrollmentsWithCounts = data?.map(e => ({
        ...e,
        courses: {
          ...e.courses,
          chapter_count: e.courses?.chapters?.count || 0
        }
      })) || [];
      
      setEnrollments(enrollmentsWithCounts);
      setLoading(false);
    };

    fetchEnrollments();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [authLoading, user, navigate, profile]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({ full_name: fullName });
    setEditing(false);
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setFullName(profile?.full_name || '');
    setEditing(false);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  return (
    <div className="py-12 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="bg-dark-card/60 backdrop-blur-xl border border-dark-border rounded-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-accent-violet/20 via-transparent to-accent-cyan/20 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="text-center md:text-left flex-grow">
                {editing ? (
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="px-4 py-2 bg-dark-bg/50 border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-violet"
                      placeholder="Enter your name"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 bg-dark-border text-white rounded-lg hover:bg-dark-bg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-2xl font-bold text-white">
                      {profile?.full_name || user?.email?.split('@')[0]}
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-slate-400">{user?.email}</p>
                <p className="text-accent-cyan text-sm mt-2">
                  Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-dark-card/60 backdrop-blur-sm border border-dark-border text-slate-300 hover:text-white hover:border-red-500/50 font-medium rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 p-8">
            <div className="text-center p-6 bg-dark-bg/50 rounded-xl border border-dark-border">
              <div className="w-12 h-12 bg-accent-violet/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-accent-violet" />
              </div>
              <p className="text-3xl font-bold text-white">{enrollments.length}</p>
              <p className="text-slate-400">Enrolled Courses</p>
            </div>
            <div className="text-center p-6 bg-dark-bg/50 rounded-xl border border-dark-border">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-white">{totalProgress}%</p>
              <p className="text-slate-400">Average Progress</p>
            </div>
            <div className="text-center p-6 bg-dark-bg/50 rounded-xl border border-dark-border">
              <div className="w-12 h-12 bg-accent-cyan/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-accent-cyan" />
              </div>
              <p className="text-3xl font-bold text-white">
                {enrollments.filter(e => e.progress === 100).length}
              </p>
              <p className="text-slate-400">Completed</p>
            </div>
          </div>
        </div>

        {enrollments.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map(enrollment => (
                <div key={enrollment.id}>
                  <CourseCard
                    course={enrollment.courses}
                    enrollment={enrollment}
                  />
                  <div className="mt-2 px-1">
                    <ProgressBar progress={enrollment.progress || 0} showLabel />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-dark-card/60 backdrop-blur-xl border border-dark-border rounded-2xl">
            <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Courses Yet
            </h3>
            <p className="text-slate-400 mb-6">
              Start learning by enrolling in a course
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all"
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
