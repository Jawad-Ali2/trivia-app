import { Injectable } from '@nestjs/common';
import { Player, Room } from './dto/room.dto';
import { Socket } from 'socket.io';
import axios from 'axios';

@Injectable()
export class EventService {
  async joinRoom(
    client: Socket,
    rooms: Map<string, Room>,
    roomId: string,
    playerId: Player,
  ) {
    const room = rooms.get(roomId);

    // TODO : Add emit for every user joined to the frontend

    const playerAlreadyJoined = room.players.includes(playerId);

    console.log(playerAlreadyJoined, rooms);
    if (playerAlreadyJoined) {
      return;
    }

    rooms.set(roomId, {
      ...room,
      players: [...room.players, playerId],
    });

    client.join(roomId);

    // TODO: Make constant of each room event seperately
    client.in(roomId).emit('playerJoined', playerId);

    console.log(rooms);
    if (rooms.get(roomId).players.length === rooms.get(roomId).maxPlayers) {
      // TODO: The following emits will generate an api call on the frontend that api will take roomID and the backend will generate questions based on that
      // Get a trivia question here from API

      const response = await axios.get('https://opentdb.com/api.php?amount=10');

      const data = response.data;

      // console.log(data);
      /* 
         I have two options now
        * Either send all the questions to the client (but maybe user can do tricks to see future questions)
        * Or send one question everytime each user has answered one question (Slow but better than above one)
        * 
        * Going with option 2 for now
      */

      rooms.set(roomId, {
        ...rooms.get(roomId),
        questions: data.results,
      });

      console.log(111111, room, rooms);

      client.emit('startGame', {
        id: roomId,
        question: rooms.get(roomId).questions[rooms.get(roomId).round],
      }); // Emitting this to current user
      client.in(roomId).emit('startGame', {
        id: roomId,
        question: rooms.get(roomId).questions[rooms.get(roomId).round],
      }); // Emitting this to inform all other users except the current one.
    }

    return 'Joined a room!';
  }

  createRoom(
    client: Socket,
    rooms: Map<string, Room>,
    playerId: Player,
    roomSize: number,
  ) {
    const roomId: string = crypto.randomUUID();

    console.log('createROOM HERE');
    rooms.set(roomId, {
      players: [playerId],
      questions: [],
      maxPlayers: roomSize,
      round: 0,
    });

    client.emit('roomJoined', roomId);
    client.join(roomId);

    return 'Room has been created!';
  }

  startGame() {
    console.log('startGame');
  }
}
