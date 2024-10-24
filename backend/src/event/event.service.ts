import { Injectable } from '@nestjs/common';
import { Player, Room, RoomStates } from './dto/room.dto';
import { Socket } from 'socket.io';
import axios from 'axios';

@Injectable()
export class EventService {
  async joinRoom(
    client: Socket,
    rooms: Map<string, Room>,
    roomId: string,
    player: Player,
    roomSize: number,
    // player: any,
  ) {
    const room = rooms.get(roomId);

    // const playerAlreadyJoined = room.players.includes(player.userId);

    const playerAlreadyJoined: boolean = room.players.some(
      (p) => p.userId === player.userId,
    );

    if (playerAlreadyJoined) {
      return { event: 'Room Joining', data: 'Player already in room' };
    }

    rooms.set(roomId, {
      ...room,
      players: [...room.players, player],
      sockets: [...room.sockets, client.id],
    });

    client.join(roomId);

    // TODO: Make constant of each room event seperately
    client.emit('roomJoined', {
      roomId,
      players: rooms.get(roomId).players,
      roomSize,
    }); // Sending emit to the user himself for array updation
    client
      .in(roomId)
      .emit('playerJoined', { players: rooms.get(roomId).players });

    console.log('Joined the lobby.', player.username);

    if (rooms.get(roomId).players.length === rooms.get(roomId).maxPlayers) {
      const response = await axios.get('https://opentdb.com/api.php?amount=10');

      const data = response.data;

      // const data = { results: [] };

      /*
       * I have two options now
       * Either send all the questions to the client (but maybe user can do tricks to see future questions)
       * Or send one question everytime each user has answered one question (Slow but better than above one)
       *
       * Going with option 2 for now
       */

      rooms.set(roomId, {
        ...rooms.get(roomId),
        questions: data.results,
        state: RoomStates.IN_PROGRESS,
      });

      const players = [];

      rooms.get(roomId).players.forEach((player) => {
        players.push({
          playerId: player.userId,
          username: player.username,
          status: player.status,
          score: '0',
          correctAnswers: 0,
          wrongAnswers: 0,
          position: '0',
        });
      });

      console.log(
        'The game has started with players.',
        players
        // rooms.get(roomId).players.map((u) => u.username),
      );

      client.emit('startGame', {
        roomId: roomId,
        players: players,
        question: rooms.get(roomId).questions[rooms.get(roomId).round],
      }); // Emitting this to current user
      client.in(roomId).emit('startGame', {
        roomId: roomId,
        players: players,
        question: rooms.get(roomId).questions[rooms.get(roomId).round],
      }); // Emitting this to inform all other users except the current one.
    }

    return 'Joined a room!';
  }

  createRoom(
    client: Socket,
    rooms: Map<string, Room>,
    player: Player,
    // player: any,
    roomSize: number,
  ) {
    const roomId: string = crypto.randomUUID();

    console.log('User has request to create lobby.', player.username);

    rooms.set(roomId, {
      players: [player],
      sockets: [client.id],
      questions: [],
      maxPlayers: roomSize,
      state: RoomStates.WAITING,
      round: 0,
    });

    client.emit('roomJoined', {
      roomId,
      players: rooms.get(roomId).players,
      roomSize,
    });
    client.join(roomId);

    return 'Room has been created!';
  }

  startGame() {
    console.log('startGame');
  }

  // TODO: Create function to send next question in queue
  nextQuestion() {
    // ! The user must be in a game to access this!!!
  }
}
