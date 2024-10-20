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
  private locks: Map<string, boolean> = new Map<string, boolean>();

  afterInit(server: Server) {
    server.use(SocketAuthMiddleware(this.jwtService));
  }

  handleConnection(socket: Socket) {
    Logger.log(`User Connected: ${socket.id} & ${socket['user'].sub}`);
  }

  handleDisconnect(socket: Socket) {
    Logger.log(`User Disconnected ${socket.id} & ${socket['user'].sub}`);

    socket.disconnect(true);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    console.log('here', body);
    const playerId = body.playerId;

    
    if (this.locks.get(playerId)) {
      return { event: 'duplicate', data: 'Request already processed' };
    }
    
    this.locks.set(playerId, true);
    
    console.log(this.locks);
    try {
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
        this.eventService.joinRoom(client, this.rooms, roomId, body.playerId);
      else {
        const roomSize = 2; // ! Hard coded change later
        this.eventService.createRoom(
          client,
          this.rooms,
          body.playerId,
          roomSize,
        );
      }
    } finally {
      this.locks.delete(playerId);
    }

    console.log("Outside of lobby logic.", this.rooms);

    return { event: 'respone', data: 'Request Completed' };
    //  console.log(this.rooms);
  }

  @SubscribeMessage('startGame')
  startGame() {
    console.log('Starting the game for the users in a lobby');
  }

  emitToClients(event: string, data: any) {
    this.server.emit(event, data);
  }
}
