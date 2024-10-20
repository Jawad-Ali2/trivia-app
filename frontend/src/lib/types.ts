export interface Trivia {
  players: Player[];
  round: string;
  correctAnswer: string;
}

export interface Player {
  playerId: number | string;
  username: string;
  score: string;
  correctAnswers: number;
  wrongAnswers: number;
  position: string;
}

export interface User {
  userId: number | string;
  username: string;
  email: string;
  role: string;
}
