import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GraduationCap, Users, Award, Clock, BookOpen, Star, Play, Zap } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-accent-violet" />,
      title: 'Expert-Led Courses',
      desc: 'Learn from industry professionals with years of experience',
    },
    {
      icon: <Clock className="w-6 h-6 text-accent-cyan" />,
      title: 'Self-Paced Learning',
      desc: 'Study at your own pace with lifetime access to materials',
    },
    {
      icon: <Award className="w-6 h-6 text-amber-400" />,
      title: 'Certificates',
      desc: 'Earn completion certificates for all courses',
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      title: 'Community Support',
      desc: 'Join our community of learners and get help anytime',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Developer',
      text: 'The AI course helped me switch to a tech role. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'Data Analyst',
      text: 'Best investment for my career. The content is fresh and practical.',
      rating: 5,
    },
    {
      name: 'Anita Desai',
      role: 'ML Engineer',
      text: 'Clear explanations and great hands-on projects. Worth every minute.',
      rating: 5,
    },
  ];

  return (
    <div className="animate-fade-in">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 via-transparent to-accent-cyan/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-violet/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent-cyan/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-dark-card/60 backdrop-blur-sm border border-accent-violet/30 px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Zap className="w-5 h-5 text-accent-violet" />
            <span className="text-sm font-medium text-slate-300">All Courses are 100% FREE</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Master <span className="bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent">Future Skills</span>
            <br />
            With Expert Guidance
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto animate-fade-in">
            Join Dalal Classes for industry-relevant courses in AI, Machine Learning,
            Data Analytics, Web Development, and Cybersecurity. All courses are completely FREE.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              to="/courses"
              className="group px-8 py-4 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Explore Courses
            </Link>
            {!user && (
              <Link
                to="/signup"
                className="px-8 py-4 bg-dark-card/60 backdrop-blur-sm border border-dark-border text-white font-semibold rounded-xl hover:border-accent-violet/50 transition-all"
              >
                Get Started Free
              </Link>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500 animate-fade-in">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-cyan" />
              5000+ Students
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent-violet" />
              5 Courses
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Free Certificates
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Why Choose Dalal Classes?
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            We provide quality education with practical approach, completely free of cost
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="p-6 bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl text-center hover:border-accent-violet/50 hover:shadow-glow transition-all animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 bg-dark-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Popular Courses
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Start your learning journey with our most popular courses - all completely free
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-40 bg-dark-bg"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-dark-bg rounded w-3/4"></div>
                    <div className="h-3 bg-dark-bg rounded w-full"></div>
                    <div className="h-3 bg-dark-bg rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : (
              courses.slice(0, 5).map((course, i) => (
                <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <CourseCard
                    course={course}
                    enrollment={enrollments[course.id]}
                  />
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 text-accent-violet font-semibold hover:text-accent-cyan transition-colors"
            >
              View All Courses →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            What Our Students Say
          </h2>
          <p className="text-slate-400 text-center mb-12">
            Real stories from our community of learners
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className="p-6 bg-dark-card/40 backdrop-blur-sm border border-dark-border rounded-2xl animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-violet/20 via-accent-cyan/20 to-accent-violet/20"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands of students already learning on Dalal Classes - completely free
          </p>
          <Link
            to="/courses"
            className="inline-block px-8 py-4 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all"
          >
            Browse Courses Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
