export enum Role {
  Player = 'player',
  Admin = 'admin',
}

export type GAME_EVENTS = {
  JoinRoom: 'joinRoom';
  StartGame: 'startGame';
  PlayerJoined: 'playerJoined';
};
