import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, Plus, Trash2, Upload, FileText, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

const CourseEditorPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newModuleData, setNewModuleData] = useState({});
  const [uploadingPdf, setUploadingPdf] = useState(null);
  
  useEffect(() => {
    if (courseId) {
      fetchCourse();
    } else {
      setLoading(false);
    }
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseData) {
      setCourse(courseData);
      
      const { data: chaptersData } = await supabase
        .from('chapters')
        .select('*, modules(*)')
        .eq('course_id', courseId)
        .order('order_index');
      
      setChapters(chaptersData || []);
      
      const expanded = {};
      chaptersData?.forEach(c => { expanded[c.id] = true; });
      setExpandedChapters(expanded);
    }
    setLoading(false);
  };

  const handleSaveCourse = async () => {
    if (!course?.title) return;
    setSaving(true);
    
    const { data, error } = courseId
      ? await supabase.from('courses').update({
          title: course.title,
          description: course.description,
          level: course.level,
          duration: course.duration,
          instructor: course.instructor,
          thumbnail: course.thumbnail,
          gradient: course.gradient,
        }).eq('id', courseId).select().single()
      : await supabase.from('courses').insert({
          title: course.title,
          description: course.description,
          level: course.level || 'Beginner',
          duration: course.duration,
          instructor: course.instructor,
          thumbnail: course.thumbnail,
          gradient: course.gradient,
        }).select().single();
    
    if (error) {
      console.error('Error saving course:', error);
    } else if (data) {
      navigate(`/admin/courses/${data.id}`, { replace: true });
    }
    setSaving(false);
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim() || !courseId) return;
    
    const { data, error } = await supabase.from('chapters').insert({
      course_id: courseId,
      title: newChapterTitle,
      order_index: chapters.length,
    }).select().single();
    
    if (!error && data) {
      setChapters([...chapters, { ...data, modules: [] }]);
      setNewChapterTitle('');
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('Delete this chapter and all its modules?')) return;
    
    await supabase.from('chapters').delete().eq('id', chapterId);
    setChapters(chapters.filter(c => c.id !== chapterId));
  };

  const handleAddModule = async (chapterId) => {
    const moduleData = newModuleData[chapterId];
    if (!moduleData?.title?.trim()) return;
    
    const chapter = chapters.find(c => c.id === chapterId);
    const orderIndex = chapter?.modules?.length || 0;
    
    const { data, error } = await supabase.from('modules').insert({
      chapter_id: chapterId,
      title: moduleData.title,
      description: moduleData.description,
      video_url: moduleData.video_url,
      duration: moduleData.duration,
      order_index: orderIndex,
    }).select().single();
    
    if (!error && data) {
      setChapters(chapters.map(c => 
        c.id === chapterId 
          ? { ...c, modules: [...(c.modules || []), data] }
          : c
      ));
      setNewModuleData({ ...newModuleData, [chapterId]: {} });
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete this module?')) return;
    
    await supabase.from('modules').delete().eq('id', moduleId);
    setChapters(chapters.map(c => ({
      ...c,
      modules: c.modules?.filter(m => m.id !== moduleId)
    })));
  };

  const handleUploadPdf = async (moduleId, file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    
    setUploadingPdf(moduleId);
    
    const fileName = `${moduleId}/${file.name}`;
    const { data, error } = await supabase.storage
      .from('course-materials')
      .upload(fileName, file, { upsert: true });
    
    if (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PDF');
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(fileName);
      
      await supabase.from('modules').update({ pdf_url: publicUrl }).eq('id', moduleId);
      
      setChapters(chapters.map(c => ({
        ...c,
        modules: c.modules?.map(m => 
          m.id === moduleId ? { ...m, pdf_url: publicUrl } : m
        )
      })));
    }
    
    setUploadingPdf(null);
  };

  const handleDeletePdf = async (moduleId) => {
    if (!confirm('Remove the PDF from this module?')) return;
    
    await supabase.from('modules').update({ pdf_url: null }).eq('id', moduleId);
    setChapters(chapters.map(c => ({
      ...c,
      modules: c.modules?.map(m => 
        m.id === moduleId ? { ...m, pdf_url: null } : m
      )
    })));
  };

  const handleUpdateModule = async (moduleId, updates) => {
    await supabase.from('modules').update(updates).eq('id', moduleId);
    setChapters(chapters.map(c => ({
      ...c,
      modules: c.modules?.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      )
    })));
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="w-8 h-8 border-4 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </button>

        {!courseId && !course && (
          <div className="bg-dark-card/60 backdrop-blur-xl border border-dark-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Course Title</label>
                <input
                  type="text"
                  value={course?.title || ''}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  placeholder="Enter course title"
                />
              </div>
              <button
                onClick={handleSaveCourse}
                disabled={saving || !course?.title}
                className="px-4 py-2 bg-accent-violet text-white rounded-lg hover:bg-accent-violet/80 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </div>
        )}

        {course && courseId && (
          <div className="space-y-6">
            <div className="bg-dark-card/60 backdrop-blur-xl border border-dark-border rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Course Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Title</label>
                  <input
                    type="text"
                    value={course.title || ''}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Level</label>
                  <select
                    value={course.level || 'Beginner'}
                    onChange={(e) => setCourse({ ...course, level: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Duration</label>
                  <input
                    type="text"
                    value={course.duration || ''}
                    onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                    placeholder="e.g., 8 weeks"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Instructor</label>
                  <input
                    type="text"
                    value={course.instructor || ''}
                    onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-sm mb-1">Description</label>
                  <textarea
                    value={course.description || ''}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white h-24"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-sm mb-1">Thumbnail URL</label>
                  <input
                    type="text"
                    value={course.thumbnail || ''}
                    onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button
                onClick={handleSaveCourse}
                disabled={saving}
                className="mt-4 px-4 py-2 bg-accent-violet text-white rounded-lg hover:bg-accent-violet/80 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="bg-dark-card/60 backdrop-blur-xl border border-dark-border rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Chapters & Modules</h2>
              
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="New chapter title"
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                />
                <button
                  onClick={handleAddChapter}
                  disabled={!newChapterTitle.trim()}
                  className="px-4 py-2 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan/80 disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Chapter
                </button>
              </div>

              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="border border-dark-border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 bg-dark-bg/50 cursor-pointer"
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedChapters[chapter.id] ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                        <span className="text-white font-medium">{chapter.title}</span>
                        <span className="text-slate-500 text-sm">
                          ({chapter.modules?.length || 0} modules)
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(chapter.id);
                        }}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {expandedChapters[chapter.id] && (
                      <div className="p-4 border-t border-dark-border space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newModuleData[chapter.id]?.title || ''}
                            onChange={(e) => setNewModuleData({
                              ...newModuleData,
                              [chapter.id]: { ...newModuleData[chapter.id], title: e.target.value }
                            })}
                            placeholder="Module title"
                            className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white"
                          />
                          <input
                            type="text"
                            value={newModuleData[chapter.id]?.duration || ''}
                            onChange={(e) => setNewModuleData({
                              ...newModuleData,
                              [chapter.id]: { ...newModuleData[chapter.id], duration: e.target.value }
                            })}
                            placeholder="Duration"
                            className="w-24 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white"
                          />
                          <button
                            onClick={() => handleAddModule(chapter.id)}
                            disabled={!newModuleData[chapter.id]?.title}
                            className="px-4 py-2 bg-accent-violet text-white rounded-lg hover:bg-accent-violet/80 disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>

                        {chapter.modules?.map((module) => (
                          <div
                            key={module.id}
                            className="flex items-center gap-4 p-3 bg-dark-bg/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-white font-medium">{module.title}</p>
                              <p className="text-slate-500 text-sm">{module.duration}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {module.pdf_url ? (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={module.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm"
                                  >
                                    <FileText className="w-4 h-4" />
                                    View PDF
                                  </a>
                                  <button
                                    onClick={() => handleDeletePdf(module.id)}
                                    className="p-1 text-red-400 hover:text-red-300"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center gap-2 px-3 py-1 bg-dark-card border border-dark-border rounded-lg cursor-pointer hover:bg-dark-bg text-slate-300 text-sm">
                                  <Upload className="w-4 h-4" />
                                  {uploadingPdf === module.id ? 'Uploading...' : 'Upload PDF'}
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => handleUploadPdf(module.id, e.target.files[0])}
                                    disabled={uploadingPdf === module.id}
                                  />
                                </label>
                              )}
                              
                              <input
                                type="text"
                                value={module.video_url || ''}
                                onChange={(e) => handleUpdateModule(module.id, { video_url: e.target.value })}
                                placeholder="Video URL"
                                className="w-48 bg-dark-card border border-dark-border rounded-lg px-3 py-1 text-white text-sm"
                              />
                              
                              <button
                                onClick={() => handleDeleteModule(module.id)}
                                className="p-2 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditorPage;