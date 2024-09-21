export type Player = {
  userId: number;
};

export type Room = {
  players: Player[];
  maxPlayers: number;
};
