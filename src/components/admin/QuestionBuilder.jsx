import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Plus,
  Trash2,
  Save,
  Check,
  X,
  Code,
  FileText,
  Clock,
  Award,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'plain', label: 'Plain Text' },
];

const QUIZ_MODES = [
  { value: 'practice', label: 'Practice', description: 'Linear flow with instant feedback' },
  { value: 'test', label: 'Test', description: 'Free navigation with results page' },
];

/**
 * QuestionBuilder - Admin component for creating/editing quiz questions
 * Supports rich question types including code blocks in questions and options
 */
const QuestionBuilder = ({ chapter, courseId, onSave }) => {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'settings'

  // Quiz settings
  const [quizSettings, setQuizSettings] = useState({
    mode: 'practice',
    passing_score: 60,
    time_limit: null,
    description: '',
  });

  useEffect(() => {
    if (chapter?.id) {
      fetchQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('chapter_id', chapter.id)
        .maybeSingle();

      if (quizData) {
        setQuiz(quizData);
        setQuestions(quizData.questions || []);
        setQuizSettings({
          mode: quizData.mode || 'practice',
          passing_score: quizData.passing_score || 60,
          time_limit: quizData.time_limit || null,
          description: quizData.description || '',
        });
      } else {
        // No quiz exists yet
        setQuiz(null);
        setQuestions([]);
        setQuizSettings({
          mode: 'practice',
          passing_score: 60,
          time_limit: null,
          description: '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
    }
    setLoading(false);
  };

  const handleSaveQuiz = async () => {
    if (!chapter?.id) return;

    setSaving(true);
    try {
      const quizData = {
        chapter_id: chapter.id,
        course_id: courseId,
        questions: questions,
        mode: quizSettings.mode,
        passing_score: quizSettings.passing_score,
        time_limit: quizSettings.time_limit,
        description: quizSettings.description,
      };

      if (quiz?.id) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', quiz.id);

        if (error) throw error;
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert(quizData)
          .select()
          .single();

        if (error) throw error;
        setQuiz(data);
      }

      onSave?.();
    } catch (err) {
      console.error('Failed to save quiz:', err);
      alert('Failed to save quiz. Please try again.');
    }
    setSaving(false);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      question: '',
      code: null, // { filename, language, content }
      options: [
        { label: '', code: false },
        { label: '', code: false },
        { label: '', code: false },
        { label: '', code: false },
      ],
      correct_answer: 0,
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestions({ ...expandedQuestions, [newQuestion.id]: true });
  };

  const deleteQuestion = (questionId) => {
    if (!confirm('Delete this question?')) return;
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const updateQuestion = (questionId, updates) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)));
  };

  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...q.options, { label: '', code: false }] }
          : q
      )
    );
  };

  const deleteOption = (questionId, optionIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        // Adjust correct_answer if needed
        let newCorrectAnswer = q.correct_answer;
        if (optionIndex === q.correct_answer) {
          newCorrectAnswer = 0;
        } else if (optionIndex < q.correct_answer) {
          newCorrectAnswer = q.correct_answer - 1;
        }
        return { ...q, options: newOptions, correct_answer: newCorrectAnswer };
      })
    );
  };

  const updateOption = (questionId, optionIndex, updates) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = [...q.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
        return { ...q, options: newOptions };
      })
    );
  };

  const toggleQuestionExpanded = (questionId) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [questionId]: !expandedQuestions[questionId],
    });
  };

  const toggleCodeBlock = (questionId) => {
    const question = questions.find((q) => q.id === questionId);
    if (question.code) {
      updateQuestion(questionId, { code: null });
    } else {
      updateQuestion(questionId, {
        code: { filename: 'code', language: 'javascript', content: '' },
      });
    }
  };

  const updateCodeBlock = (questionId, updates) => {
    const question = questions.find((q) => q.id === questionId);
    if (question?.code) {
      updateQuestion(questionId, { code: { ...question.code, ...updates } });
    }
  };

  const toggleOptionCode = (questionId, optionIndex) => {
    const question = questions.find((q) => q.id === questionId);
    const option = question?.options?.[optionIndex];
    if (option) {
      updateOption(questionId, optionIndex, { code: !option.code });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-elevated/60 backdrop-blur-xl border border-line/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Quiz Questions</h2>
          <p className="text-slate-400 text-sm mt-1">
            {questions.length} question{questions.length !== 1 ? 's' : ''} for "{chapter?.title}"
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'questions'
                ? 'bg-brand text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-brand text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6 mb-6">
          {/* Quiz Mode */}
          <div>
            <label className="block text-slate-400 text-sm mb-3">Quiz Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUIZ_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setQuizSettings({ ...quizSettings, mode: mode.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    quizSettings.mode === mode.value
                      ? 'border-brand bg-brand/10'
                      : 'border-line/20 hover:border-line/40'
                  }`}
                >
                  <div className="font-medium text-white">{mode.label}</div>
                  <div className="text-sm text-slate-400 mt-1">{mode.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Passing Score */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">
              <Award className="w-4 h-4 inline mr-1" />
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={quizSettings.passing_score}
              onChange={(e) =>
                setQuizSettings({
                  ...quizSettings,
                  passing_score: parseInt(e.target.value) || 60,
                })
              }
              className="w-32 bg-base border border-line/20 rounded-lg px-4 py-2 text-white"
            />
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time Limit (minutes, optional)
            </label>
            <input
              type="number"
              min="1"
              placeholder="No limit"
              value={quizSettings.time_limit || ''}
              onChange={(e) =>
                setQuizSettings({
                  ...quizSettings,
                  time_limit: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-32 bg-base border border-line/20 rounded-lg px-4 py-2 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Quiz Description / Instructions
            </label>
            <textarea
              value={quizSettings.description}
              onChange={(e) =>
                setQuizSettings({ ...quizSettings, description: e.target.value })
              }
              placeholder="Enter instructions for students..."
              className="w-full bg-base border border-line/20 rounded-lg px-4 py-2 text-white h-24 resize-none"
            />
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {questions.map((question, qIdx) => (
            <div
              key={question.id}
              className="border border-line/20 rounded-xl overflow-hidden"
            >
              {/* Question Header */}
              <div
                className="flex items-center justify-between p-4 bg-base/50 cursor-pointer"
                onClick={() => toggleQuestionExpanded(question.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedQuestions[question.id] ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-slate-500 font-mono text-sm">
                    Q{qIdx + 1}
                  </span>
                  <span className="text-white font-medium truncate max-w-md">
                    {question.question || 'Untitled Question'}
                  </span>
                  {question.code && (
                    <Code className="w-4 h-4 text-accent-cyan" />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQuestion(question.id);
                  }}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Question Body */}
              {expandedQuestions[question.id] && (
                <div className="p-4 border-t border-line/20 space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(question.id, { question: e.target.value })
                      }
                      placeholder="Enter your question..."
                      className="w-full bg-base border border-line/20 rounded-lg px-4 py-2 text-white h-20 resize-none"
                    />
                  </div>

                  {/* Code Block Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Code Block
                    </span>
                    <button
                      onClick={() => toggleCodeBlock(question.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        question.code
                          ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50'
                          : 'bg-base border border-line/20 text-slate-400 hover:text-white'
                      }`}
                    >
                      {question.code ? 'Remove Code' : 'Add Code'}
                    </button>
                  </div>

                  {/* Code Block Editor */}
                  {question.code && (
                    <div className="space-y-3 p-4 bg-black/40 rounded-xl border border-line/20">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={question.code.filename}
                          onChange={(e) =>
                            updateCodeBlock(question.id, { filename: e.target.value })
                          }
                          placeholder="Filename (e.g., styles.css)"
                          className="flex-1 bg-base border border-line/20 rounded-lg px-4 py-2 text-white text-sm"
                        />
                        <select
                          value={question.code.language}
                          onChange={(e) =>
                            updateCodeBlock(question.id, { language: e.target.value })
                          }
                          className="bg-base border border-line/20 rounded-lg px-4 py-2 text-white text-sm"
                        >
                          {LANGUAGE_OPTIONS.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={question.code.content}
                        onChange={(e) =>
                          updateCodeBlock(question.id, { content: e.target.value })
                        }
                        placeholder="Enter code snippet..."
                        className="w-full bg-base border border-line/20 rounded-lg px-4 py-2 text-white font-mono text-sm h-32 resize-none"
                      />
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="block text-slate-400 text-sm">
                      Answer Options
                    </label>
                    {question.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 ${
                          question.correct_answer === optIdx
                            ? 'border-emerald-500/50 bg-emerald-500/10'
                            : 'border-line/20'
                        }`}
                      >
                        {/* Radio button for correct answer */}
                        <button
                          onClick={() =>
                            updateQuestion(question.id, { correct_answer: optIdx })
                          }
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            question.correct_answer === optIdx
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-slate-500 hover:border-slate-400'
                          }`}
                        >
                          {question.correct_answer === optIdx && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>

                        {/* Option content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono text-sm w-6">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <button
                              onClick={() => toggleOptionCode(question.id, optIdx)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${
                                option.code
                                  ? 'bg-accent-cyan/20 text-accent-cyan'
                                  : 'bg-base text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {option.code ? 'Plain Text' : '<> Code'}
                            </button>
                          </div>

                          {option.code ? (
                            <textarea
                              value={option.label}
                              onChange={(e) =>
                                updateOption(question.id, optIdx, { label: e.target.value })
                              }
                              placeholder="Enter code..."
                              className="w-full bg-base border border-line/20 rounded-lg px-4 py-2 text-white font-mono text-sm h-20 resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) =>
                                updateOption(question.id, optIdx, { label: e.target.value })
                              }
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="w-full bg-base border border-line/20 rounded-lg px-4 py-2 text-white"
                            />
                          )}
                        </div>

                        {/* Delete option button */}
                        {question.options.length > 2 && (
                          <button
                            onClick={() => deleteOption(question.id, optIdx)}
                            className="p-2 text-red-400 hover:text-red-300 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add option button */}
                    <button
                      onClick={() => addOption(question.id)}
                      className="w-full py-2 border-2 border-dashed border-line/30 rounded-xl text-slate-400 hover:text-white hover:border-line/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Question Button */}
          <button
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-brand/30 rounded-xl text-brand hover:text-white hover:border-brand/50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-end gap-4">
        <span className="text-slate-400 text-sm">
          {saving ? 'Saving...' : questions.length > 0 ? 'Ready to save' : 'No questions'}
        </span>
        <button
          onClick={handleSaveQuiz}
          disabled={saving || questions.length === 0}
          className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/80 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuestionBuilder;
