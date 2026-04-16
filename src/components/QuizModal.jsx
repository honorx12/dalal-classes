import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

const QuizModal = ({ chapter, courseId, onClose, onComplete }) => {
  const { user } = useAuthStore();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canRetry, setCanRetry] = useState(true);
  const [lastAttempt, setLastAttempt] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [chapter.id]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('chapter_id', chapter.id)
        .single();

      if (quizError || !quizData) {
        setError('Quiz not available for this chapter');
        setLoading(false);
        return;
      }

      setQuiz(quizData);

      const questionsData = quizData.questions || [];
      setQuestions(questionsData);

      if (user) {
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', user.id)
          .eq('quiz_id', quizData.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (attempts && attempts.length > 0) {
          const last = attempts[0];
          setLastAttempt(last);
          
          const cooldownMs = CONFIG.quiz.retryCooldownHours * 60 * 60 * 1000;
          const timeSince = Date.now() - new Date(last.created_at).getTime();
          setCanRetry(timeSince >= cooldownMs);
        }
      }
    } catch (err) {
      setError('Failed to load quiz');
    }
    setLoading(false);
  };

  const handleAnswerSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const newQuestions = [...questions];
    newQuestions[currentQuestion].userAnswer = selectedAnswer;
    newQuestions[currentQuestion].isCorrect = selectedAnswer === questions[currentQuestion].correct_answer;
    setQuestions(newQuestions);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setSubmitting(true);
    
    const correctCount = questions.filter(q => q.isCorrect).length;
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);

    try {
      await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        quiz_id: quiz.id,
        chapter_id: chapter.id,
        score: finalScore,
        passed: finalScore >= CONFIG.quiz.passMark,
      });

      if (finalScore >= CONFIG.quiz.passMark) {
        await supabase.from('chapters').update({ quiz_passed: true }).eq('id', chapter.id);
      }
    } catch (err) {
      console.error('Failed to save attempt:', err);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative bg-dark-card border border-dark-border rounded-2xl p-8 max-w-lg w-full">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-dark-card border border-dark-border rounded-2xl p-8 max-w-lg w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Quiz Unavailable</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-accent-violet text-white font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (lastAttempt && !canRetry && !showResult && score === 0) {
    const hoursLeft = Math.ceil((CONFIG.quiz.retryCooldownHours * 60 * 60 * 1000 - (Date.now() - new Date(lastAttempt.created_at).getTime())) / (60 * 60 * 1000));
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-dark-card border border-dark-border rounded-2xl p-8 max-w-lg w-full text-center">
          <Clock className="w-16 h-16 text-accent-cyan mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Please Wait</h2>
          <p className="text-slate-400 mb-4">
            You can retry this quiz after {hoursLeft} hours
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Your last score: {lastAttempt.score}%
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-accent-violet text-white font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (score > 0) {
    const passed = score >= CONFIG.quiz.passMark;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-dark-card border border-dark-border rounded-2xl p-8 max-w-lg w-full text-center animate-slide-up">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}>
            {passed ? (
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          
          <p className="text-slate-400 mb-6">
            {passed 
              ? 'You passed the quiz and completed this chapter!' 
              : `You need ${CONFIG.quiz.passMark}% to pass. Try again in ${CONFIG.quiz.retryCooldownHours} hours.`}
          </p>
          
          <div className={`text-5xl font-bold mb-6 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {score}%
          </div>

          <div className="text-sm text-slate-400 mb-6">
            {questions.filter(q => q.isCorrect).length} of {questions.length} correct
          </div>
          
          <div className="flex gap-4">
            {!passed && (
              <button
                onClick={() => {
                  setScore(0);
                  setCurrentQuestion(0);
                  setQuestions(questions.map(q => ({ ...q, userAnswer: null, isCorrect: null })));
                  setShowResult(false);
                  setSelectedAnswer(null);
                  setLastAttempt({ ...lastAttempt, created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent-violet/20 border border-accent-violet/50 text-accent-violet font-semibold rounded-xl"
              >
                <RotateCcw className="w-5 h-5" />
                Retry Quiz
              </button>
            )}
            <button
              onClick={() => {
                if (passed) onComplete?.();
                onClose();
              }}
              className={`flex-1 px-6 py-3 font-semibold rounded-xl ${
                passed 
                  ? 'bg-gradient-to-r from-accent-violet to-accent-cyan text-white' 
                  : 'bg-dark-border text-white'
              }`}
            >
              {passed ? 'Continue' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const options = q?.options || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-dark-card border border-dark-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{chapter.title} Quiz</h2>
            <p className="text-sm text-slate-400">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-border text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="h-1 bg-dark-bg">
          <div 
            className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <p className="text-lg text-white mb-6">{q?.question}</p>

          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = showResult && index === q.correct_answer;
              const isWrong = showResult && isSelected && index !== q.correct_answer;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    isCorrect
                      ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                      : isWrong
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : isSelected
                      ? 'bg-accent-violet/20 border-2 border-accent-violet text-white'
                      : 'bg-dark-bg/50 border-2 border-dark-border text-slate-300 hover:border-accent-violet/50'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                  {isCorrect && <CheckCircle className="w-5 h-5 inline ml-2" />}
                  {isWrong && <XCircle className="w-5 h-5 inline ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-dark-border">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full py-3 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow transition-all"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
