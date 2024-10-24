export type Player = {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: 'playing' | 'left';
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  position: number;
};

export type TriviaQuestions = {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
};

export type Room = {
  players: Player[];
  sockets: string[];
  questions: TriviaQuestions[];
  state: string;
  maxPlayers: number;
  round: number;
};

export enum RoomStates {
  WAITING = 'Waiting',
  IN_PROGRESS = 'In Progress',
  FINISHED = 'Finished',
}

export type Trivia = {
  players: Player[];
  question: string;
  correctAnswer: string;
  options: string[];
  round: number;
};

export interface ScoreUpdateDTO {
  userId: string;
  trivia: Trivia;
  roomId: string;
  isCorrect: boolean;
  timeTaken: number;
  totalTime: number;
}
