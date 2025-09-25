import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface GameState {
  currentScreen: 'wheel' | 'questions';
  selectedSeat: number | null;
  availableSeats: number[];
  questions: Question[];
  selectedQuestions: number[];
  questionAttempts: Record<number, number>; // Track attempts per question ID
  currentQuestion: Question | null;
  playerAttempts: number;
  showResult: boolean;
  lastAnswer: 'correct' | 'incorrect' | null;
  timeLimit: number; // Dynamic time limit
  maxSeats: number; // Configurable seat limit
}

type GameAction =
  | { type: 'SELECT_SEAT'; payload: number }
  | { type: 'START_QUESTION'; payload: Question }
  | { type: 'ANSWER_QUESTION'; payload: { correct: boolean } }
  | { type: 'RESET_QUESTION' }
  | { type: 'COMPLETE_QUESTION'; payload: number }
  | { type: 'RETURN_TO_WHEEL' }
  | { type: 'SHOW_RESULT'; payload: boolean }
  | { type: 'RESET_ATTEMPTS' }
  | { type: 'SET_MAX_SEATS'; payload: number };

const gameQuestions: Question[] = [
  {
    id: 1,
    question: 'Tên gọi chính thức của cuộc thi chạy có quãng đường 42,195 km là gì?',
    options: ['Half Marathon', 'Marathon', 'Ultra Marathon', 'Sprint Marathon'],
    correct: 1
  },
  {
    id: 2,
    question: 'Khởi động trước khi chạy có tác dụng chính là gì?',
    options: ['Tăng sức bền', 'Giúp giảm cân', 'Giảm nguy cơ chấn thương', 'Tăng tốc độ'],
    correct: 2
  },
  {
    id: 3,
    question: 'Loại chấn thương phổ biến nhất mà người chạy bộ hay gặp phải là gì?',
    options: ['Chấn thương cổ tay', 'Đau đầu gối (Runner\'s Knee)', 'Đau lưng', 'Chấn thương vai'],
    correct: 1
  },
  {
    id: 4,
    question: 'Thời gian tốt nhất để nạp năng lượng sau khi chạy là trong khoảng thời gian nào?',
    options: ['Ngay lập tức', 'Sau 2 giờ', '30 phút đầu tiên', 'Sau 4 giờ'],
    correct: 2
  },
  {
    id: 5,
    question: 'Biểu hiện của "chuột rút" là gì?',
    options: ['Cảm giác châm chích ở chân', 'Buồn nôn', 'Co thắt cơ đột ngột', 'Hoa mắt'],
    correct: 2
  },
  {
    id: 6,
    question: 'Đôi giày chuyên dụng cho chạy bộ có đặc điểm gì nổi bật?',
    options: ['Cứng và nhẹ', 'Có độ đàn hồi và đệm tốt', 'Lớp đế mỏng', 'Bề mặt nhẵn'],
    correct: 1
  },
  {
    id: 7,
    question: 'Mục đích của việc hít thở bằng bụng khi chạy là gì?',
    options: ['Giảm đau', 'Tăng hiệu quả hô hấp', 'Giúp cơ bắp săn chắc', 'Giảm mệt mỏi'],
    correct: 1
  },
  {
    id: 8,
    question: 'Tại sao không nên chạy quá sức khi mới bắt đầu?',
    options: ['Gây lãng phí năng lượng', 'Dễ dẫn đến chấn thương và nản chí', 'Giảm tốc độ', 'Giảm khả năng đốt mỡ'],
    correct: 1
  },
  {
    id: 9,
    question: 'Tên tiếng Anh của môn chạy bộ là gì?',
    options: ['Walking', 'Swimming', 'Running', 'Cycling'],
    correct: 2
  },
  {
    id: 10,
    question: 'Tác dụng của việc bổ sung nước điện giải khi chạy là gì?',
    options: ['Hỗ trợ tiêu hóa', 'Bù nước và khoáng chất bị mất', 'Tăng tốc độ', 'Giảm cân nhanh hơn'],
    correct: 1
  }
];

const initialState: GameState = {
  currentScreen: 'wheel',
  selectedSeat: null,
  availableSeats: Array.from({ length: 60 }, (_, i) => i + 1),
  questions: gameQuestions,
  selectedQuestions: [],
  questionAttempts: {},
  currentQuestion: null,
  playerAttempts: 0,
  showResult: false,
  lastAnswer: null,
  timeLimit: 15,
  maxSeats: 60
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  // Safety check to ensure state is properly initialized
  if (!state || !state.selectedQuestions) {
    console.error('State is corrupted, reinitializing...', state);
    return initialState;
  }

  switch (action.type) {
    case 'SELECT_SEAT':
      return {
        ...state,
        selectedSeat: action.payload,
        availableSeats: state.availableSeats.filter(seat => seat !== action.payload),
        currentScreen: 'questions'
      };
    
    case 'START_QUESTION':
      const startQuestionId = action.payload.id;
      const attempts = state.questionAttempts[startQuestionId] || 0;
      return {
        ...state,
        currentQuestion: action.payload,
        playerAttempts: 0,
        showResult: false,
        lastAnswer: null,
        timeLimit: attempts > 0 ? 10 : 15 // Reduced time for retry
      };
    
    case 'ANSWER_QUESTION':
      const newAttempts = state.playerAttempts + 1;
      const answerQuestionId = state.currentQuestion?.id || 0;
      const questionAttempts = state.questionAttempts[answerQuestionId] || 0;
      
      return {
        ...state,
        playerAttempts: newAttempts,
        lastAnswer: action.payload.correct ? 'correct' : 'incorrect',
        showResult: action.payload.correct || newAttempts >= 2,
        questionAttempts: {
          ...state.questionAttempts,
          [answerQuestionId]: questionAttempts + 1
        }
      };
    
    case 'RESET_QUESTION':
      return {
        ...state,
        playerAttempts: 0,
        showResult: false,
        lastAnswer: null,
        timeLimit: 10
      };
    
    case 'COMPLETE_QUESTION':
      return {
        ...state,
        selectedQuestions: [...(state.selectedQuestions || []), action.payload]
      };
    
    case 'SET_MAX_SEATS':
      return {
        ...state,
        maxSeats: action.payload,
        availableSeats: Array.from({ length: action.payload }, (_, i) => i + 1),
        selectedQuestions: state.selectedQuestions || [] // Ensure array exists
      };
    
    case 'RETURN_TO_WHEEL':
      return {
        ...state,
        currentScreen: 'wheel',
        currentQuestion: null,
        playerAttempts: 0,
        showResult: false,
        lastAnswer: null,
        timeLimit: 15
      };
    
    case 'SHOW_RESULT':
      return {
        ...state,
        showResult: action.payload
      };
    
    case 'RESET_ATTEMPTS':
      return {
        ...state,
        playerAttempts: 0,
        lastAnswer: null
      };
    
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};