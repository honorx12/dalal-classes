// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GraduationCap, Users, Award, Clock, BookOpen, Star } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');
      
      setCourses(coursesData || []);

      if (user) {
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('user_id', user.id);
        
        const enrollMap = {};
        enrollData?.forEach(e => {
          enrollMap[e.course_id] = e;
        });
        setEnrollments(enrollMap);
      }
    };
    fetchData();
  }, [user]);

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-amber-500" />,
      title: 'Expert-Led Courses',
      desc: 'Learn from industry professionals with years of experience',
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      title: 'Self-Paced Learning',
      desc: 'Study at your own pace with lifetime access to materials',
    },
    {
      icon: <Award className="w-6 h-6 text-amber-500" />,
      title: 'Certificates',
      desc: 'Earn completion certificates for all courses',
    },
    {
      icon: <Users className="w-6 h-6 text-amber-500" />,
      title: 'Community Support',
      desc: 'Join our community of learners and get help anytime',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Developer at TCS',
      text: 'The AI course helped me switch to a tech role. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'Data Analyst at Infosys',
      text: 'Best investment for my career. The content is fresh and practical.',
      rating: 5,
    },
    {
      name: 'Anita Desai',
      role: 'ML Engineer at Wipro',
      text: 'Clear explanations and great hands-on projects. Worth every rupee.',
      rating: 5,
    },
  ];

  return (
    <div>
      <section className="hero-gradient text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-medium">Trusted by 5000+ Students</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Master <span className="text-amber-400">Future Skills</span>
            <br />
            With Expert Guidance
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join Dalal Classes for industry-relevant courses in AI, Machine Learning,
            Data Analytics, and Web Development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
            >
              Explore Courses
            </Link>
            {!user && (
              <Link
                to="/signup"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Why Choose Dalal Classes?
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            We provide quality education with practical approach
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-2xl text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Popular Courses
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Start your learning journey with our most popular courses
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollments[course.id]}
              />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              View All Courses →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-slate-600 text-center mb-12">
            Real stories from our community of learners
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-2xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 hero-gradient text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-slate-300 mb-8">
            Join thousands of students already learning on Dalal Classes
          </p>
          <Link
            to="/courses"
            className="inline-block px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
          >
            Browse Courses Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
