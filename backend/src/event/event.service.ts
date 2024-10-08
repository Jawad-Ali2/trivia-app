import { Injectable } from '@nestjs/common';
import { Player, Room } from './dto/room.dto';
import { Socket } from 'socket.io';

@Injectable()
export class EventService {
  joinRoom(
    client: Socket,
    rooms: Map<string, Room>,
    roomId: string,
    playerId: Player,
  ) {
    const room = rooms.get(roomId);

    // TODO : Add emit for every user joined to the frontend

    const playerAlreadyJoined = room.players.includes(playerId);

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
      client.emit('startGame'); // Emitting this to current user
      // client.
      client.in(roomId).emit('startGame'); // Emitting this to inform all other users except the current one.
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

    rooms.set(roomId, {
      players: [playerId],
      maxPlayers: roomSize,
    });

    client.emit('roomJoined', roomId)
    client.join(roomId);

    return 'Room has been created!';
  }

  startGame() {
    console.log('startGame');
  }
}
