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
import {
  LobbyType,
  Player,
  Room,
  RoomStates,
  ScoreUpdateDTO,
} from './dto/room.dto';
import { Throttle } from '@nestjs/throttler';
import {
  calculateScore,
  getQuestions,
  getShuffledOptions,
} from 'src/common/utils';

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

    await this.waitForUnlock(player.userId);

    this.userRequests.set(player.userId, now);
    this.locks.set(player.userId, true);

    // console.log(this.locks);
    try {
      let spaceAvailable = false;
      let roomId = null;

      for (const [key, room] of this.rooms.entries()) {
        if (
          room.players.length < room.maxPlayers &&
          room.state === RoomStates.WAITING &&
          room.lobbyType === LobbyType.PUBLIC
        ) {
          spaceAvailable = true;
          roomId = key;
          break;
        }
      }

      // // ! Efficient
      // const availableRoom = Array.from(this.rooms.values()).find(room => room.players < room.maxPlayers);
      const roomSize = 2; // ! Hard coded change later
      const questionsPerRound = 5;
      const maxRounds = 5;
      const roomType = LobbyType.PUBLIC;

      player.status = 'playing';
      if (spaceAvailable && roomId)
        await this.eventService.joinRoom(
          client,
          this.rooms,
          roomId,
          player,
          roomSize,
        );
      else {
        this.eventService.createRoom(
          client,
          null, // This is the room Id
          this.rooms,
          player,
          roomSize,
          maxRounds,
          questionsPerRound,
          roomType,
        );
      }
    } finally {
      this.locks.delete(player.userId);
    }

    return { event: 'respone', data: 'Request Completed' };
    //  console.log(this.rooms);
  }

  async waitForUnlock(playerId: string) {
    while (this.locks.get(playerId)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  @SubscribeMessage('joinPrivateRoom')
  async joinPrivateRoom(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    // If player emit this signal that means the body has private lobby type
    const { roomType, player, roomId, roomSize, maxRounds, questionsPerRound } =
      body;

    if (!player) return { error: 'Something went wrong' };
    const now = new Date();
    const lastRequestTime = this.userRequests.get(player.userId);

    if (lastRequestTime && now.getTime() - lastRequestTime.getTime() < 1000)
      return {
        event: 'duplicate',
        data: 'Player sent too many requests at the same time',
      };

    // if (this.locks.get(player.userId)) {
    //   return { event: 'duplicate', data: 'Request already processed' };
    // }

    await this.waitForUnlock(player.userId);

    this.userRequests.set(player.userId, now);
    this.locks.set(player.userId, true);

    try {
      const room = this.rooms.get(roomId);

      if (!room) {
        this.eventService.createRoom(
          client,
          roomId,
          this.rooms,
          player,
          roomSize,
          maxRounds,
          questionsPerRound,
          roomType,
        );
      } else {
        if (room.players.length >= room.maxPlayers) {
          console.log('Room has no space mayn sorry.');
          return;
        }
        console.log('Joining');
        await this.eventService.joinRoom(
          client,
          this.rooms,
          roomId,
          player,
          roomSize,
        );
      }
    } finally {
      this.locks.delete(player.userId);
    }
  }

  @SubscribeMessage('submitAnswer')
  async submitAnswer(
    @MessageBody() body: ScoreUpdateDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const {
      userId,
      trivia,
      roomId,
      optionSelected,
      questionIndex,
      isCorrect,
      timeTaken,
      totalTime,
      givenOptions,
    } = body;
    const now = new Date();
    const lastRequestTime = this.userRequests.get(userId);

    if (lastRequestTime && now.getTime() - lastRequestTime.getTime() < 1000)
      return {
        event: 'duplicate',
        data: 'Player sent too many requests at the same time',
      };

    if (this.locks.get(userId)) {
      return { event: 'duplicate', data: 'Request already processed' };
    }

    await this.waitForUnlock(userId);

    this.userRequests.set(userId, now);
    this.locks.set(userId, true);

    try {
      await this.eventService.submitQuestion({
        userId,
        trivia,
        roomId,
        optionSelected,
        questionIndex,
        isCorrect,
        timeTaken,
        totalTime,
        givenOptions,
        client,
        rooms: this.rooms,
      });
      return {
        event: 'Update score',
        data: `${userId}'s score has been updated`,
      };
    } finally {
      this.locks.delete(userId);
    }
  }

  @SubscribeMessage('startGame')
  startGame() {
    console.log('Starting the game for the users in a lobby');
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() body, @ConnectedSocket() client: Socket) {
    const now = new Date();
    const lastRequestTime = this.userRequests.get(body.player.userId);

    console.log('PLAYER REQUESTED TO LEAVE', body.player.username);
    if (lastRequestTime && now.getTime() - lastRequestTime.getTime() < 1000)
      return {
        event: 'duplicate',
        data: 'Player sent too many requests at the same time',
      };

    this.userRequests.set(body.player.userId, now);

    const room = this.rooms.get(body.roomId);

    if (room?.state === RoomStates.WAITING) {
      room.players = room.players.filter(
        (player) => player.userId !== body.player.userId,
      );
      room.sockets = room.sockets.filter((socket) => socket !== client.id);
    } else {
      room.players.forEach((player) => {
        if (player.userId == body.player.userId) {
          player.status = 'left';
        }
      });
    }

    if (room.players.length === 0) this.rooms.delete(body.roomId);
    else {
      client
        .in(body.roomId)
        .emit('playerLeft', { room: body.trivia, players: room.players });
      this.rooms.set(body.roomId, room);
    }
    // TODO: If the player leaves during waiting state then just filter array
    // TODO: But if the player leaves during the match just mark as inactive/left

    // Emit to the room that player has left
    client.leave(body.roomId);
  }
}
