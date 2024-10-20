export type Player = {
  userId: number;
};

export type TriviaQuestions = {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}

export type Room = {
  players: Player[];
  questions: TriviaQuestions[];
  maxPlayers: number;
  round: number;
};
