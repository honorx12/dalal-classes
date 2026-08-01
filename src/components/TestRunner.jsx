import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Code,
  FileQuestion,
  Trophy,
  ArrowRight,
  Save,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';

/**
 * TestRunner - NetAcad-style test component
 * Features:
 * - Free navigation between questions via pill buttons
 * - Autosave progress as you answer
 * - Code block support in questions and answers
 * - Results page with Reset and Review Assessment options
 * - Integrated with the CourseOutline rail (not a modal overlay)
 */
const TestRunner = ({ quiz, chapter, courseId, onClose, onComplete }) => {
  const { user } = useAuthStore();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [view, setView] = useState('test'); // 'test' | 'results' | 'review'
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Initialize test
  useEffect(() => {
    initializeTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id]);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || view !== 'test') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, view]);

  const initializeTest = async () => {
    setLoading(true);
    try {
      if (!quiz || !quiz.questions) {
        setError('Quiz data not available');
        setLoading(false);
        return;
      }

      // Parse questions with support for code blocks
      const parsedQuestions = quiz.questions.map((q, idx) => ({
        ...q,
        index: idx,
        id: q.id || `q-${idx}`,
      }));
      setQuestions(parsedQuestions);

      // Check for existing draft attempt
      if (user) {
        const { data: existingAttempt } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', user.id)
          .eq('quiz_id', quiz.id)
          .is('completed_at', null)
          .single();

        if (existingAttempt) {
          setAttemptId(existingAttempt.id);
          // Restore answers
          const restoredAnswers = {};
          (existingAttempt.answers || []).forEach((ans) => {
            restoredAnswers[ans.questionIndex] = ans.selectedOption;
          });
          setAnswers(restoredAnswers);
        } else {
          // Create new draft attempt
          const { data: newAttempt } = await supabase
            .from('quiz_attempts')
            .insert({
              user_id: user.id,
              quiz_id: quiz.id,
              chapter_id: chapter.id,
              course_id: courseId,
              answers: [],
              score: 0,
              passed: false,
              completed_at: null,
            })
            .select()
            .single();

          if (newAttempt) {
            setAttemptId(newAttempt.id);
          }
        }
      }

      // Set timer if time limit exists
      if (quiz.time_limit) {
        setTimeRemaining(quiz.time_limit * 60); // Convert minutes to seconds
      }
    } catch (err) {
      setError('Failed to initialize test');
      console.error(err);
    }
    setLoading(false);
  };

  // Debounced autosave
  const debouncedSave = useCallback(
    debounce(async (questionIndex, selectedOption) => {
      if (!attemptId || !user) return;

      setSaving(true);
      try {
        // Get current answers from DB
        const { data: currentAttempt } = await supabase
          .from('quiz_attempts')
          .select('answers')
          .eq('id', attemptId)
          .single();

        const currentAnswers = currentAttempt?.answers || [];
        const answerIndex = currentAnswers.findIndex((a) => a.questionIndex === questionIndex);

        if (answerIndex >= 0) {
          currentAnswers[answerIndex].selectedOption = selectedOption;
        } else {
          currentAnswers.push({ questionIndex, selectedOption });
        }

        await supabase
          .from('quiz_attempts')
          .update({ answers: currentAnswers })
          .eq('id', attemptId);
      } catch (err) {
        console.error('Failed to save answer:', err);
      }
      setSaving(false);
    }, 500),
    [attemptId, user]
  );

  const selectAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));

    // Trigger autosave
    debouncedSave(questionIndex, optionIndex);
  };

  const submitTest = async () => {
    if (!user || !attemptId) return;

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    const hasPassed = finalScore >= (quiz.passing_score || 60);

    setScore(finalScore);
    setPassed(hasPassed);

    try {
      await supabase
        .from('quiz_attempts')
        .update({
          score: finalScore,
          passed: hasPassed,
          completed_at: new Date().toISOString(),
          answers: Object.entries(answers).map(([questionIndex, selectedOption]) => ({
            questionIndex: parseInt(questionIndex),
            selectedOption,
          })),
        })
        .eq('id', attemptId);

      // Update chapter progress if passed
      if (hasPassed) {
        await supabase
          .from('chapters')
          .update({ quiz_passed: true })
          .eq('id', chapter.id);
      }
    } catch (err) {
      console.error('Failed to submit test:', err);
    }

    setView('results');
  };

  const resetTest = async () => {
    // Delete old attempt and create new draft
    if (attemptId) {
      await supabase.from('quiz_attempts').delete().eq('id', attemptId);
    }

    setAnswers({});
    setActiveQuestion(0);
    setScore(0);
    setPassed(false);
    setView('test');
    setAttemptId(null);

    // Create new draft
    if (user) {
      const { data: newAttempt } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quiz.id,
          chapter_id: chapter.id,
          course_id: courseId,
          answers: [],
          score: 0,
          passed: false,
          completed_at: null,
        })
        .select()
        .single();

      if (newAttempt) {
        setAttemptId(newAttempt.id);
      }
    }

    // Reset timer
    if (quiz.time_limit) {
      setTimeRemaining(quiz.time_limit * 60);
    }
  };

  const reviewTest = () => {
    setView('review');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to normalize option (support both string and object with code)
  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return option?.label || option?.text || '';
  };

  const isOptionCode = (option) => {
    if (typeof option === 'string') return false;
    return option?.code === true || option?.isCode === true;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-accent-rose mx-auto mb-4" />
          <h2 className="text-xl font-bold text-content mb-2">Test Unavailable</h2>
          <p className="text-content-muted mb-6">{error}</p>
          <button onClick={onClose} className="px-6 py-3 bg-brand text-white font-semibold rounded-xl">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Results View
  if (view === 'results') {
    return (
      <div className="flex-1 p-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-elevated border border-line/10 rounded-2xl p-8 text-center"
        >
          <div
            className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              passed ? 'bg-emerald-500/20' : 'bg-accent-rose/20'
            }`}
          >
            {passed ? (
              <Trophy className="w-12 h-12 text-emerald-400" />
            ) : (
              <FileQuestion className="w-12 h-12 text-accent-rose" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-content mb-2">
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <p className="text-content-muted mb-6">
            {passed
              ? 'You passed the test and completed this chapter!'
              : `You need ${quiz.passing_score || 60}% to pass.`}
          </p>

          <div className={`text-6xl font-bold mb-2 ${passed ? 'text-emerald-400' : 'text-accent-rose'}`}>
            {score}%
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-content-muted mb-8">
            <span className={passed ? 'text-emerald-400 font-medium' : 'text-accent-rose font-medium'}>
              {questions.filter((q, idx) => answers[idx] === q.correct_answer).length} of{' '}
              {questions.length} correct
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetTest}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-surface/10 border border-line/20 text-content font-semibold rounded-xl hover:bg-surface/20 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
            <button
              onClick={reviewTest}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand/20 border border-brand/50 text-brand font-semibold rounded-xl hover:bg-brand/30 transition-colors"
            >
              <FileQuestion className="w-5 h-5" />
              Review Assessment
            </button>
            <button
              onClick={() => {
                if (passed) onComplete?.();
                onClose();
              }}
              className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl ${
                passed
                  ? 'bg-gradient-vivid text-white hover:shadow-glow-brand'
                  : 'bg-surface/10 text-content'
              }`}
            >
              {passed ? (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                'Close'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Review View
  if (view === 'review') {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-content">Review Assessment</h2>
          <button
            onClick={() => setView('results')}
            className="px-4 py-2 text-content-muted hover:text-content transition-colors"
          >
            Back to Results
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correct_answer;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-elevated border rounded-2xl p-6 ${
                  isCorrect ? 'border-emerald-500/30' : 'border-accent-rose/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-emerald-500 text-white' : 'bg-accent-rose text-white'
                    }`}
                  >
                    {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-content mb-4 font-medium">
                      Q{idx + 1}. {q.question}
                    </p>

                    {/* Code block if present */}
                    {q.code && (
                      <div className="mb-4 bg-black/40 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10">
                          <span className="text-xs text-slate-400">{q.code.filename || 'code'}</span>
                          <span className="text-xs text-slate-500">{q.code.language || 'text'}</span>
                        </div>
                        <pre className="p-3 text-sm font-mono text-slate-300 overflow-x-auto">
                          <code>{q.code.content}</code>
                        </pre>
                      </div>
                    )}

                    <div className="space-y-2">
                      {(q.options || []).map((option, optIdx) => {
                        const isUserSelection = userAnswer === optIdx;
                        const isCorrectAnswer = optIdx === q.correct_answer;
                        const label = getOptionLabel(option);
                        const codeOption = isOptionCode(option);

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border ${
                              isCorrectAnswer
                                ? 'bg-emerald-500/10 border-emerald-500/50'
                                : isUserSelection && !isCorrect
                                ? 'bg-accent-rose/10 border-accent-rose/50'
                                : 'bg-surface/5 border-line/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-sm font-mono ${
                                  isCorrectAnswer
                                    ? 'text-emerald-400'
                                    : isUserSelection && !isCorrect
                                    ? 'text-accent-rose'
                                    : 'text-slate-400'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span
                                className={`flex-1 ${
                                  codeOption ? 'font-mono text-sm' : ''
                                } ${
                                  isCorrectAnswer
                                    ? 'text-emerald-400'
                                    : isUserSelection && !isCorrect
                                    ? 'text-accent-rose'
                                    : 'text-slate-300'
                                }`}
                              >
                                {label}
                              </span>
                              {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                              {isUserSelection && !isCorrect && <XCircle className="w-4 h-4 text-accent-rose" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setView('results')}
            className="px-6 py-3 bg-brand text-white font-semibold rounded-xl hover:shadow-glow-brand transition-all"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  // Test View (main question interface)
  const currentQ = questions[activeQuestion];

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      {/* Header with pills and timer */}
      <div className="p-4 border-b border-line/10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-content">{chapter.title} Test</h2>
            <p className="text-sm text-content-muted">{questions.length} questions</p>
          </div>
          {timeRemaining !== null && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                timeRemaining < 60 ? 'bg-accent-rose/20 text-accent-rose' : 'bg-surface/10 text-content'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Question Pills */}
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = answers[idx] !== undefined;
            const isActive = idx === activeQuestion;

            return (
              <button
                key={idx}
                onClick={() => setActiveQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-brand text-white'
                    : isAnswered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-surface/10 text-slate-400 border border-line/20 hover:border-slate-400'
                }`}
              >
                Q{idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {saving && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 mb-4 animate-pulse">
              <Save className="w-4 h-4" />
              Saving progress...
            </div>
          )}

          <motion.div
            key={activeQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl text-content mb-6 font-medium">
              Q{activeQuestion + 1}. {currentQ?.question}
            </h3>

            {/* Code block if present */}
            {currentQ?.code && (
              <div className="mb-6 bg-black/40 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    {currentQ.code.filename || 'code'}
                  </span>
                  <span className="text-xs text-slate-500 uppercase">{currentQ.code.language || 'text'}</span>
                </div>
                <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                  <code>{currentQ.code.content}</code>
                </pre>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {(currentQ?.options || []).map((option, idx) => {
                const isSelected = answers[activeQuestion] === idx;
                const label = getOptionLabel(option);
                const codeOption = isOptionCode(option);

                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(activeQuestion, idx)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      isSelected
                        ? 'bg-brand/20 border-brand text-content'
                        : 'bg-surface/5 border-line/10 text-content-secondary hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium ${
                          isSelected ? 'bg-brand text-white' : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`flex-1 ${codeOption ? 'font-mono text-sm' : ''}`}>{label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-line/10">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={() => setActiveQuestion((prev) => Math.max(0, prev - 1))}
            disabled={activeQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-content-muted hover:text-content disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-content-muted">
              {Object.keys(answers).length} of {questions.length} answered
            </span>

            {activeQuestion < questions.length - 1 ? (
              <button
                onClick={() => setActiveQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-6 py-2 bg-brand text-white font-medium rounded-lg hover:shadow-glow-brand transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={submitTest}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-all"
              >
                Submit Test
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default TestRunner;
