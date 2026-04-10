// src/pages/CoursesPage.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import CourseCard from '../components/CourseCard';
import { BookOpen } from 'lucide-react';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');
      setCourses(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            All Courses
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore our comprehensive courses designed to help you master the latest technologies
            and advance your career.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="mt-12 p-6 bg-slate-100 rounded-2xl">
          <h3 className="font-semibold text-slate-900 mb-2">
            Free Preview Available
          </h3>
          <p className="text-slate-600 text-sm">
            All courses include free access to chapters 1-3. Sign up to preview
            course content before purchasing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
