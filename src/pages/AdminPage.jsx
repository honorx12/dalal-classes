import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { Users, BookOpen, Award, Shield, RefreshCw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEnrollments: 0,
    totalCourses: 0,
  });
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [usersRes, enrollmentsRes, coursesRes] = await Promise.all([
      supabase.rpc('get_users_with_emails'),
      supabase.rpc('get_enrollments_with_user_emails', { limit_count: 50 }),
      supabase
        .from('courses')
        .select(`
          *,
          chapters(count)
        `)
        .order('created_at'),
    ]);

    setUsers(usersRes.data || []);
    setEnrollments(enrollmentsRes.data || []);
    setCourses(coursesRes.data || []);

    const enrollmentCounts = {};
    enrollmentsRes.data?.forEach(e => {
      enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1;
    });

    const coursesWithCounts = coursesRes.data?.map(c => ({
      ...c,
      enrollment_count: enrollmentCounts[c.id] || 0,
    })) || [];

    setStats({
      totalUsers: usersRes.data?.length || 0,
      totalEnrollments: enrollmentsRes.data?.length || 0,
      totalCourses: coursesRes.data?.length || 0,
    });

    setCourses(coursesWithCounts);
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'enrollments', label: 'Enrollments' },
    { id: 'courses', label: 'Courses' },
  ];

  return (
    <div className="py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brand to-accent-cyan rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Welcome, {profile?.full_name || 'Admin'}</p>
          </div>
          <button
            onClick={fetchData}
            className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-elevated rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-elevated/60 backdrop-blur-xl border border-line/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-slate-400 text-sm">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-elevated/60 backdrop-blur-xl border border-line/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalEnrollments}</p>
                <p className="text-slate-400 text-sm">Total Enrollments</p>
              </div>
            </div>
          </div>
          <div className="bg-elevated/60 backdrop-blur-xl border border-line/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-cyan/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
                <p className="text-slate-400 text-sm">Total Courses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-elevated/60 backdrop-blur-xl border border-line/20 rounded-2xl overflow-hidden">
          <div className="flex border-b border-line/20 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-brand border-b-2 border-brand bg-brand/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white">Recent Enrollments</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-slate-400 text-sm border-b border-line/20">
                            <th className="pb-3 pr-4">User</th>
                            <th className="pb-3 pr-4">Course</th>
                            <th className="pb-3 pr-4">Progress</th>
                            <th className="pb-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.slice(0, 5).map((enrollment) => (
                            <tr key={enrollment.id} className="border-b border-line/10">
                              <td className="py-3 pr-4">
                                <div>
                                  <p className="text-white font-medium">
                                    {enrollment.user_full_name || 'Unknown'}
                                  </p>
                                  <p className="text-slate-500 text-sm">
                                    {enrollment.user_email}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 pr-4 text-slate-300">
                                {enrollment.course_title || 'Unknown'}
                              </td>
                              <td className="py-3 pr-4">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  enrollment.progress === 100
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-brand/20 text-brand'
                                }`}>
                                  {enrollment.progress || 0}%
                                </span>
                              </td>
                              <td className="py-3 text-slate-500 text-sm">
                                {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-slate-400 text-sm border-b border-line/20">
                          <th className="pb-3 pr-4">Name</th>
                          <th className="pb-3 pr-4">Email</th>
                          <th className="pb-3 pr-4">Admin</th>
                          <th className="pb-3">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-line/10">
                            <td className="py-3 pr-4 text-white font-medium">
                              {u.full_name || 'No name'}
                            </td>
                            <td className="py-3 pr-4 text-slate-400">
                              {u.email || 'N/A'}
                            </td>
                            <td className="py-3 pr-4">
                              {u.is_admin ? (
                                <span className="px-2 py-1 bg-brand/20 text-brand rounded text-sm">
                                  Admin
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-base text-slate-500 rounded text-sm">
                                  User
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-500 text-sm">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'enrollments' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-slate-400 text-sm border-b border-line/20">
                          <th className="pb-3 pr-4">User</th>
                          <th className="pb-3 pr-4">Email</th>
                          <th className="pb-3 pr-4">Course</th>
                          <th className="pb-3 pr-4">Progress</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment) => (
                          <tr key={enrollment.id} className="border-b border-line/10">
                            <td className="py-3 pr-4 text-white font-medium">
                              {enrollment.user_full_name || 'Unknown'}
                            </td>
                            <td className="py-3 pr-4 text-slate-400">
                              {enrollment.user_email || 'N/A'}
                            </td>
                            <td className="py-3 pr-4 text-slate-300">
                              {enrollment.course_title || 'Unknown'}
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-base rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-brand to-accent-cyan rounded-full"
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                  />
                                </div>
                                <span className="text-slate-400 text-sm">
                                  {enrollment.progress || 0}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-500 text-sm">
                              {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div className="space-y-4">
                    <button
                      onClick={() => navigate('/admin/courses/new')}
                      className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/80"
                    >
                      <Plus className="w-4 h-4" />
                      Create Course
                    </button>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-slate-400 text-sm border-b border-line/20">
                            <th className="pb-3 pr-4">Course</th>
                            <th className="pb-3 pr-4">Level</th>
                            <th className="pb-3 pr-4">Chapters</th>
                            <th className="pb-3">Enrollments</th>
                            <th className="pb-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course) => (
                            <tr key={course.id} className="border-b border-line/10">
                              <td className="py-3 pr-4">
                                <p className="text-white font-medium">{course.title}</p>
                              </td>
                              <td className="py-3 pr-4">
                                <span className="px-2 py-1 bg-base text-slate-400 rounded text-sm">
                                  {course.level || 'Beginner'}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-slate-300">
                                {course.chapters?.count || 0}
                              </td>
                              <td className="py-3">
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm">
                                  {course.enrollment_count || 0}
                                </span>
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                                  className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded text-sm hover:bg-accent-cyan/30"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

export default AdminPage;
