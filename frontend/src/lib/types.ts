export type Trivia = {
  players: Player[];
  question: string;
  correctAnswer: string;
  options: string[];
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
};

export type User = {
  userId: string;
  username: string;
  email: string;
  role: string;
};


export interface ScoreUpdateDTO {
  userId: string;
  // question: string;
  trivia: Trivia;
  roomId: string;
  isCorrect: boolean;
  timeTaken: number;
  totalTime: number;
}