export type Trivia = {
  players: Player[];
  question: string;
  correctAnswer: string;
  options: string[];
  questionNo: number;
  round: number;
};

export type Question = {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
};

export type Player = {
  userId: number | string;
  username: string;
  email: string;
  role: string;
  status: "playing" | "left";
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  position: number;
  answered: boolean; // To keep track if everyone has answered
};

export type User = {
  userId: string;
  username: string;
  email: string;
  role: string;
};

export type ScoreUpdateDTO = {
  userId: string;
  // question: string;
  trivia: Trivia;
  roomId: string;
  questionIndex: number;
  optionSelected: string;
  isCorrect: boolean;
  timeTaken: number;
  totalTime: number;
}

export type PlayerPerformance = {
  userId: string;
  username: string;
  totalScore: number;
  rounds: RoundPerformance[];
  correctAnswers: number;
  wrongAnswers: number;
  averageTimePerRound: number;
  finalPosition: number;
  status?: "complete" | "left";
};

export type RoundPerformance = {
  round: number;
  questions: {
    question: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
    scoreGained: number;
  }[];
};

export type GameResult = {
  roomId: string;
  playersPerformance: PlayerPerformance[];
  totalRounds: number;
  winningPlayer?: PlayerPerformance;
  endTime: Date;
};
