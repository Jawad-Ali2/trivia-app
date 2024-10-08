import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { EventService } from './event.service';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guards/ws.guard';
import { JwtService } from '@nestjs/jwt';
import { SocketAuthMiddleware } from 'src/common/middlewares/ws.middleware';
import { Room } from './dto/room.dto';

@WebSocketGateway({
  namespace: 'rooms',
  cors: process.env.CLIENT_URI,
})
@UseGuards(WsJwtGuard)
export class EventGateway {
  @WebSocketServer() server: Server;
  constructor(
    private readonly eventService: EventService,
    private readonly jwtService: JwtService,
  ) {}
  private rooms: Map<string, Room> = new Map();

  afterInit(server: Server) {
    server.use(SocketAuthMiddleware(this.jwtService));
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    console.log('here', body);
    let spaceAvailable = false;
    let roomId = null;

    for (const [key, room] of this.rooms.entries()) {
      if (room.players.length < room.maxPlayers) {
        spaceAvailable = true;
        roomId = key;
        break;
      }
    }

    // // ! Efficient
    // const availableRoom = Array.from(this.rooms.values()).find(room => room.players < room.maxPlayers);

    if (spaceAvailable && roomId)
      return this.eventService.joinRoom(
        client,
        this.rooms,
        roomId,
        body.playerId,
      );

    const roomSize = 2; // ! Hard coded change later
    return this.eventService.createRoom(
      client,
      this.rooms,
      body.playerId,
      roomSize,
    );

    //  console.log(this.rooms);
  }

  @SubscribeMessage('startGame')
  startGame() {
    console.log('Starting the game for the users in a lobby');
  }
}
