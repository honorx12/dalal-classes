import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CourseCard from '../components/CourseCard';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { BookOpen, Search, Grid3X3, List, Filter } from 'lucide-react';
import SectionHeading from '../components/marketing/SectionHeading';
import GlowCTA from '../components/marketing/GlowCTA';
import { StaggerGroup, StaggerItem, fadeInUp } from '../lib/motion';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
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
      setFilteredCourses(coursesWithCounts);

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

  // Filter courses based on search and level
  useEffect(() => {
    let filtered = courses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(c =>
        c.level?.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    setFilteredCourses(filtered);
  }, [searchQuery, selectedLevel, courses]);

  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="min-h-screen bg-base pt-16">
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <SectionHeading
              label="Catalog"
              title="All courses"
              subtitle="Structured curricula that take you from fundamentals to mastery. Start free — Pro courses included with a Pro plan."
            />
          </div>

          {/* Search and Filters — sticky glass toolbar */}
          <div className="sticky top-16 z-30 mb-8 space-y-4">
            <div className="glass-card p-3 flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="input-field pl-12"
                />
              </div>

              {/* Level Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <Filter className="w-5 h-5 text-content-muted flex-shrink-0" />
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedLevel === level
                        ? 'text-white'
                        : 'text-content-secondary hover:text-content bg-surface/[0.04] border border-line/10'
                    }`}
                  >
                    {selectedLevel === level && (
                      <motion.span
                        layoutId="level-pill"
                        className="absolute inset-0 rounded-lg bg-gradient-brand"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{level === 'all' ? 'All Levels' : level}</span>
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-surface/[0.04] border border-line/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-brand/20 text-brand'
                      : 'text-content-muted hover:text-content'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-brand/20 text-brand'
                      : 'text-content-muted hover:text-content'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-content-muted px-1">
              <span>Showing {filteredCourses.length} of {courses.length} courses</span>
              {(searchQuery || selectedLevel !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLevel('all');
                  }}
                  className="text-accent-cyan hover:text-brand transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                : 'grid-cols-1'
            }`}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`animate-pulse ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
                  <div className={`bg-line/10 rounded-xl ${viewMode === 'list' ? 'w-48 h-32' : 'h-44'}`} />
                  <div className="p-5 space-y-3 flex-1">
                    <div className="h-5 bg-line/10 rounded w-3/4" />
                    <div className="h-4 bg-line/10 rounded w-full" />
                    <div className="h-4 bg-line/10 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <StaggerGroup className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                : 'grid-cols-1'
            }`}>
              {filteredCourses.map((course) => (
                <StaggerItem key={course.id} variants={fadeInUp}>
                  <CourseCard
                    course={course}
                    enrollment={enrollments[course.id]}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <div className="text-center py-16 card-raised">
              <BookOpen className="w-16 h-16 text-content-muted mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-content mb-2">No courses found</h3>
              <p className="text-content-secondary mb-6">Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('all');
                }}
                className="btn-primary px-6 py-3 font-display"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <GlowCTA
        title="Can't find what you're looking for?"
        subtitle="Tell us what you want to learn — we build our roadmap from learner requests."
        primaryLabel="Request a course"
        primaryTo="/profile"
        secondaryLabel="View pricing"
      />
    </div>
  );
};

export default CoursesPage;
