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
  answered: boolean; // To keep track if everyone has answered
};

export type TriviaQuestions = {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

export type Answer = {
  userId: string;
  answer: string;
  isCorrect: boolean;
  round: number;
}

export type Room = {
  players: Player[];
  sockets: string[];
  questions: TriviaQuestions[];
  playerAnswers: Answer[];
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
  // question: string;
  trivia: Trivia;
  roomId: string;
  optionSelected: string;
  isCorrect: boolean;
  timeTaken: number;
  totalTime: number;
}
