import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CourseCard from '../components/CourseCard';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Sparkles } from 'lucide-react';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*, chapters(count)')
        .order('created_at');

      const coursesWithCounts = coursesData?.map(c => ({
        ...c,
        chapter_count: c.chapters?.count || 0
      })) || [];
      setCourses(coursesWithCounts);

      if (user) {
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id);
        
        const enrollMap = {};
        enrollData?.forEach(e => {
          enrollMap[e.course_id] = e;
        });
        setEnrollments(enrollMap);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="py-12 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            All Courses
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore our comprehensive courses designed to help you master the latest technologies
            and advance your career. All courses are completely FREE!
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm">
            <Sparkles className="w-4 h-4" />
            100% Free - No Hidden Charges
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-dark-bg"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-dark-bg rounded w-3/4"></div>
                  <div className="h-3 bg-dark-bg rounded w-full"></div>
                  <div className="h-3 bg-dark-bg rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {courses.map((course, i) => (
              <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <CourseCard
                  course={course}
                  enrollment={enrollments[course.id]}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl">
          <h3 className="font-semibold text-white mb-2">
            Enroll Instantly
          </h3>
          <p className="text-slate-400 text-sm">
            Simply click "Enroll Now" on any course - no payment required. All chapters unlock immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
