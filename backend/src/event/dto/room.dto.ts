export type Player = {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: string; // Tells if the user is playing or has left
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
