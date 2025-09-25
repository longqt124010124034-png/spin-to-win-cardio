import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, CheckCircle, XCircle, Gift } from 'lucide-react';

export const QuestionBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(state.timeLimit);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
    if (state.currentQuestion && !state.showResult) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - show correct answer
            setShowCorrectAnswer(true);
            dispatch({ type: 'ANSWER_QUESTION', payload: { correct: false } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.currentQuestion, state.showResult, dispatch]);

  useEffect(() => {
    // Reset timer when new question starts
    if (state.currentQuestion && state.playerAttempts === 0) {
      setTimeLeft(state.timeLimit);
      setSelectedAnswer(null);
      setShowCorrectAnswer(false);
    }
  }, [state.currentQuestion, state.playerAttempts, state.timeLimit]);

  // Early return after all hooks have been called
  if (state.currentScreen !== 'questions') return null;

  const selectRandomQuestion = () => {
    const availableQuestions = state.questions.filter(
      q => !state.selectedQuestions.includes(q.id)
    );
    
    if (availableQuestions.length > 0) {
      const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      dispatch({ type: 'START_QUESTION', payload: randomQuestion });
    }
  };

  const handleAnswerClick = (answerIndex: number) => {
    if (state.showResult || selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === state.currentQuestion?.correct;
    
    setTimeout(() => {
      dispatch({ type: 'ANSWER_QUESTION', payload: { correct: isCorrect } });
      
      if (!isCorrect && state.playerAttempts >= 1) {
        // Show correct answer after 2 wrong attempts
        setShowCorrectAnswer(true);
      }
    }, 1000);
  };

  const resetQuestion = () => {
    dispatch({ type: 'RESET_QUESTION' });
  };

  const returnToWheel = () => {
    // Mark question as completed if answered correctly
    if (state.lastAnswer === 'correct' && state.currentQuestion) {
      dispatch({ type: 'COMPLETE_QUESTION', payload: state.currentQuestion.id });
    }
    
    setTimeout(() => {
      dispatch({ type: 'RETURN_TO_WHEEL' });
    }, 2000);
  };

  const canResetQuestion = () => {
    if (!state.currentQuestion) return false;
    const attempts = state.questionAttempts[state.currentQuestion.id] || 0;
    return attempts < 2 && state.lastAnswer === 'incorrect' && state.playerAttempts >= 2;
  };

  const renderQuestionNumbers = () => {
    return (
      <div className="grid grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => state.selectedQuestions.includes(num) ? null : selectRandomQuestion()}
            disabled={state.selectedQuestions.includes(num)}
            className={`
              w-16 h-16 rounded-full border-4 font-bold text-xl transition-all duration-300
              ${state.selectedQuestions.includes(num)
                ? 'bg-muted border-muted-foreground text-muted-foreground cursor-not-allowed'
                : 'bg-game-gold border-game-white text-white neumorphism hover:scale-110 sparkle-animation'
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  const getAnswerButtonClass = (index: number) => {
    const baseClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 font-medium";
    
    if (!state.showResult && selectedAnswer === null) {
      return `${baseClass} bg-card border-border hover:border-primary hover:bg-primary/10 cursor-pointer`;
    }
    
    if (selectedAnswer === index) {
      const isCorrect = index === state.currentQuestion?.correct;
      return `${baseClass} ${
        isCorrect 
          ? 'bg-green-500/20 border-green-500 text-green-400' 
          : 'bg-red-500/20 border-red-500 text-red-400 shake'
      }`;
    }
    
    if (showCorrectAnswer && index === state.currentQuestion?.correct) {
      return `${baseClass} bg-green-500/20 border-green-500 text-green-400 pulse-glow`;
    }
    
    return `${baseClass} bg-card border-border opacity-50`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'RETURN_TO_WHEEL' })}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về vòng quay</span>
        </Button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-game-white mb-1">
            Người chơi ghế số {state.selectedSeat}
          </h2>
          <p className="text-muted-foreground">Chọn câu hỏi và trả lời đúng để nhận quà!</p>
        </div>
        
        <div className="w-32"></div> {/* Spacer */}
      </div>

      {/* Question Numbers */}
      {!state.currentQuestion && (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-6 text-game-white">
            Chọn một câu hỏi:
          </h3>
          {renderQuestionNumbers()}
        </div>
      )}

      {/* Question Display */}
      {state.currentQuestion && (
        <div className="glassmorphism rounded-2xl p-8 mb-6 fade-in">
          {/* Timer */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-game-blue'}`} />
              <span className={`font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-game-blue'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Lần thử: {state.playerAttempts + 1}/2
            </div>
          </div>

          {/* Progress Bar */}
          <Progress 
            value={(state.timeLimit - timeLeft) / state.timeLimit * 100} 
            className={`mb-6 h-3 ${timeLeft <= 5 ? 'animate-pulse ring-2 ring-red-400' : ''}`}
          />

          {/* Question */}
          <h3 className="text-2xl font-semibold mb-8 text-game-white leading-relaxed">
            {state.currentQuestion.question}
          </h3>

          {/* Answer Options */}
          <div className="grid gap-4 mb-6">
            {state.currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={state.showResult || selectedAnswer !== null}
                className={getAnswerButtonClass(index)}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Result Display */}
          {state.showResult && (
            <div className="text-center bounce-in">
              {state.lastAnswer === 'correct' ? (
                <div className="text-green-400 mb-4">
                  <CheckCircle className="w-16 h-16 mx-auto mb-2 fireworks" />
                  <h4 className="text-2xl font-bold mb-2">Chính xác! 🎉</h4>
                  <p className="text-lg mb-4">Chúc mừng! Bạn đã trả lời đúng!</p>
                  <div className="flex items-center justify-center space-x-2 text-game-gold">
                    <Gift className="w-6 h-6" />
                    <span className="font-bold text-xl">Nhận quà ngay!</span>
                  </div>
                </div>
              ) : (
                <div className="text-red-400 mb-4">
                  <XCircle className="w-16 h-16 mx-auto mb-2 shake" />
                  <h4 className="text-2xl font-bold mb-2">
                    {state.playerAttempts >= 2 ? 'Hết lượt thử!' : 'Chưa đúng!'}
                  </h4>
                  <p className="text-lg mb-4">
                    {state.playerAttempts >= 2 
                      ? 'Đáp án đúng đã được highlight.' 
                      : 'Bạn còn 1 lần thử nữa!'}
                  </p>
                  
                  {canResetQuestion() && (
                    <Button
                      onClick={resetQuestion}
                      className="mb-4 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-xl mr-4"
                    >
                      🔄 Thử lại (10s)
                    </Button>
                  )}
                </div>
              )}
              
              <Button
                onClick={returnToWheel}
                className="mt-4 bg-game-gold hover:bg-game-gold/90 text-white font-bold px-8 py-3 rounded-xl"
              >
                Tiếp tục chơi
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};