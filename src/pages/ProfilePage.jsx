import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { 
  LogOut, 
  User, 
  BookOpen, 
  Award, 
  Clock, 
  Edit2, 
  Save, 
  X, 
  Bookmark, 
  FileText, 
  Bell,
  ChevronRight,
  Trash2
} from 'lucide-react';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';

const ProfilePage = () => {
  const { user, profile, logout, loading: authLoading, updateProfile } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Fetch enrollments
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            *,
            chapters(count)
          )
        `)
        .eq('user_id', user.id);
      
      const enrollmentsWithCounts = enrollData?.map(e => ({
        ...e,
        courses: {
          ...e.courses,
          chapter_count: e.courses?.chapters?.count || 0
        }
      })) || [];
      
      setEnrollments(enrollmentsWithCounts);

      // Fetch bookmarks with module and course info
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select(`
          *,
          modules (
            id,
            title,
            chapter:chapters (
              id,
              title,
              course:courses (
                id,
                title,
                gradient
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setBookmarks(bookmarkData || []);

      // Fetch notes with module info
      const { data: notesData } = await supabase
        .from('notes')
        .select(`
          *,
          modules (
            id,
            title,
            chapter:chapters (
              id,
              title,
              course:courses (
                id,
                title
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      setNotes(notesData || []);

      // Fetch notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setNotifications(notifData || []);
      
      setLoading(false);
    };

    fetchData();
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

  const removeBookmark = async (bookmarkId) => {
    await supabase.from('bookmarks').delete().eq('id', bookmarkId);
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    await supabase.from('notes').delete().eq('id', noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const markNotificationRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-base">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-base pt-16">
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20 p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="text-center md:text-left flex-grow">
                  {editing ? (
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
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
                          className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <h1 className="font-display text-2xl font-bold text-white">
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
                  <p className="text-cyan-400 text-sm mt-2">
                    Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:text-white hover:border-rose-500/50 font-medium rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8">
              <div className="text-center p-6 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-violet-400" />
                </div>
                <p className="font-display text-3xl font-bold text-white">{enrollments.length}</p>
                <p className="text-slate-400 text-sm">Enrolled</p>
              </div>
              <div className="text-center p-6 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="font-display text-3xl font-bold text-white">{totalProgress}%</p>
                <p className="text-slate-400 text-sm">Avg Progress</p>
              </div>
              <div className="text-center p-6 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="font-display text-3xl font-bold text-white">{bookmarks.length}</p>
                <p className="text-slate-400 text-sm">Bookmarks</p>
              </div>
              <div className="text-center p-6 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <p className="font-display text-3xl font-bold text-white">{enrollments.filter(e => e.progress === 100).length}</p>
                <p className="text-slate-400 text-sm">Completed</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'courses', label: 'My Courses', icon: BookOpen },
              { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: bookmarks.length },
              { id: 'notes', label: 'Notes', icon: FileText, count: notes.length },
              { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <>
                {enrollments.length > 0 ? (
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
                ) : (
                  <div className="text-center py-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                    <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold text-white mb-2">No Courses Yet</h3>
                    <p className="text-slate-400 mb-6">Start learning by enrolling in a course</p>
                    <button
                      onClick={() => navigate('/courses')}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all font-display"
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <>
                {bookmarks.length > 0 ? (
                  <div className="space-y-3">
                    {bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-violet-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${bookmark.modules?.chapter?.course?.gradient || 'from-violet-600 to-cyan-500'} flex items-center justify-center`}>
                            <Bookmark className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <Link
                              to={`/courses/${bookmark.modules?.chapter?.course?.id}/module/${bookmark.modules?.id}`}
                              className="font-display font-semibold text-white hover:text-cyan-400 transition-colors"
                            >
                              {bookmark.modules?.title}
                            </Link>
                            <p className="text-slate-500 text-sm">
                              {bookmark.modules?.chapter?.course?.title} • {bookmark.modules?.chapter?.title}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeBookmark(bookmark.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                    <Bookmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold text-white mb-2">No Bookmarks</h3>
                    <p className="text-slate-400 mb-6">Bookmark modules to save them for later</p>
                    <button
                      onClick={() => navigate('/courses')}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all font-display"
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <>
                {notes.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-violet-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <Link
                            to={`/courses/${note.modules?.chapter?.course?.id}/module/${note.modules?.id}`}
                            className="font-display font-semibold text-white hover:text-cyan-400 transition-colors"
                          >
                            {note.modules?.title}
                          </Link>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-slate-500 text-sm mb-3">
                          {note.modules?.chapter?.course?.title}
                        </p>
                        <p className="text-slate-300 text-sm line-clamp-3">{note.content}</p>
                        <p className="text-slate-600 text-xs mt-3">
                          Updated {new Date(note.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold text-white mb-2">No Notes</h3>
                    <p className="text-slate-400 mb-6">Take notes while learning to review later</p>
                    <button
                      onClick={() => navigate('/courses')}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all font-display"
                    >
                      Start Learning
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <>
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-colors ${
                          !notification.read 
                            ? 'bg-violet-500/10 border border-violet-500/20' 
                            : 'bg-white/[0.03] border border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.read ? 'bg-cyan-400' : 'bg-slate-600'
                          }`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{notification.title}</h4>
                            <p className="text-slate-400 text-sm mt-1">{notification.message}</p>
                            <p className="text-slate-600 text-xs mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {notification.link && (
                            <Link
                              to={notification.link}
                              className="flex items-center gap-1 text-cyan-400 text-sm hover:text-cyan-300"
                            >
                              View
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                    <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold text-white mb-2">No Notifications</h3>
                    <p className="text-slate-400">You will receive notifications about your progress here</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
