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
import { Player, Room, RoomStates } from './dto/room.dto';
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 3, ttl: 1000 } })
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
  private userRequests = new Map<string, Date>();

  afterInit(server: Server) {
    server.use(SocketAuthMiddleware(this.jwtService));
  }

  handleConnection(socket: Socket) {
    Logger.log(`User Connected: ${socket.id} & ${socket['user'].username}`);
  }

  handleDisconnect(socket: Socket) {
    Logger.log(`User Disconnected ${socket.id} & ${socket['user'].username}`);

    socket.disconnect(true);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() { player }: { player: Player },
    @ConnectedSocket() client: Socket,
  ) {
    if (!player) return { error: 'Something went wrong' };
    // console.log('here', player.userId, player);
    const now = new Date();
    const lastRequestTime = this.userRequests.get(player.userId);

    if (lastRequestTime && now.getTime() - lastRequestTime.getTime() < 1000)
      return {
        event: 'duplicate',
        data: 'Player sent too many requests at the same time',
      };

    if (this.locks.get(player.userId)) {
      return { event: 'duplicate', data: 'Request already processed' };
    }

    this.userRequests.set(player.userId, now);
    this.locks.set(player.userId, true);

    // console.log(this.locks);
    try {
      let spaceAvailable = false;
      let roomId = null;

      for (const [key, room] of this.rooms.entries()) {
        if (
          room.players.length < room.maxPlayers &&
          room.state === RoomStates.WAITING
        ) {
          spaceAvailable = true;
          roomId = key;
          break;
        }
      }

      // // ! Efficient
      // const availableRoom = Array.from(this.rooms.values()).find(room => room.players < room.maxPlayers);
      const roomSize = 2; // ! Hard coded change later
      player.status = 'active';
      if (spaceAvailable && roomId)
        await this.eventService.joinRoom(
          client,
          this.rooms,
          roomId,
          player,
          roomSize,
        );
      else {
        this.eventService.createRoom(client, this.rooms, player, roomSize);
      }
    } finally {
      this.locks.delete(player.userId);
    }

    // console.log('Outside of lobby logic.', this.rooms.);

    return { event: 'respone', data: 'Request Completed' };
    //  console.log(this.rooms);
  }

  @SubscribeMessage('startGame')
  startGame() {
    console.log('Starting the game for the users in a lobby');
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() body, @ConnectedSocket() client: Socket) {
    console.log('Leaving room', body.roomId, this.rooms);
    const room = this.rooms.get(body.roomId);

    console.log('Before', room);

    if (room?.state === RoomStates.WAITING) {
      room.players = room.players.filter(
        (player) => player.userId !== body.user.userId,
      );
      room.sockets = room.sockets.filter((socket) => socket !== client.id);
    }

    console.log('After', room);

    this.rooms.set(body.roomId, room);

    client.emit('playerLeft', { players: this.rooms.get(body.roomId).players });
  }
}
