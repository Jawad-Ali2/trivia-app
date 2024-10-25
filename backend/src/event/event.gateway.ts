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
import { Player, Room, RoomStates, ScoreUpdateDTO } from './dto/room.dto';
import { Throttle } from '@nestjs/throttler';
import { calculateScore, getShuffledOptions } from 'src/common/utils';

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
        this.eventService.createRoom(client, this.rooms, player, roomSize);
      }
    } finally {
      this.locks.delete(player.userId);
    }

    return { event: 'respone', data: 'Request Completed' };
    //  console.log(this.rooms);
  }

  @SubscribeMessage('submitAnswer')
  submitAnswer(
    @MessageBody() body: ScoreUpdateDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const {
      userId,
      trivia,
      roomId,
      optionSelected,
      isCorrect,
      timeTaken,
      totalTime,
    } = body;
    let playersAnsweredCount = 0;
    let disconnectedPlayer = 0;
    const room = this.rooms.get(roomId);

    const score = calculateScore(isCorrect, totalTime - timeTaken);

    room.players.forEach((player) => {
      if (player.userId === userId) {
        room.playerAnswers.push({
          userId: player.userId,
          answer: optionSelected,
          isCorrect: isCorrect,
          round: room.round,
        });
        player.answered = true;
        player.score += score;

        if (isCorrect) {
          player.correctAnswers++;
        } else {
          player.wrongAnswers++;
        }
      }

      if (player.status === 'left') disconnectedPlayer++;
      if (player.answered) playersAnsweredCount++;
    });

    room.players.sort((a, b) => b.score - a.score);

    room.players.forEach((player, index) => {
      player.position = index + 1;
    });

    if (room.maxPlayers === playersAnsweredCount + disconnectedPlayer) {
      // Stop every player's countdown and let them know next round is starting
      client.emit('roundFinished', {
        roundFinished: true,
      });
      client.in(roomId).emit('roundFinished', {
        roundFinished: true,
      });

      // current round has finished
      // if(room.round ) // TODO: If the rounds equal to lobby rounds limit we finish the game

      room.round++;
      room.players.forEach((player) => {
        player.answered = false;
      });

      const options = getShuffledOptions(
        room.questions[room.round].incorrect_answers,
        room.questions[room.round].correct_answer,
      );

      // Todo: Maybe just emit nextRound and update the states in it so we don't have to emit scoreUpdate even after round finishes.....
      trivia.correctAnswer = room.questions[room.round].correct_answer;
      trivia.options = options;
      trivia.players = room.players;
      trivia.question = room.questions[room.round].question;
      trivia.round = room.round;

      // Emit next round announcement here
      client.emit('nextRound', {
        roomId: roomId,
        players: room.players,
        question: room.questions[room.round],
        options,
        round: room.round,
      });
      client.in(roomId).emit('nextRound', {
        roomId: roomId,
        players: room.players,
        question: room.questions[room.round],
        options,
        round: room.round,
      });
    }

    this.rooms.set(roomId, room);

    // console.log(room.players);
    client.emit('scoreUpdate', { players: room.players, room: trivia });
    client
      .in(roomId)
      .emit('scoreUpdate', { players: room.players, room: trivia });

    return {
      event: 'Update score',
      data: `${userId}'s score has been updated`,
    };
  }

  @SubscribeMessage('startGame')
  startGame() {
    console.log('Starting the game for the users in a lobby');
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() body, @ConnectedSocket() client: Socket) {
    const now = new Date();
    const lastRequestTime = this.userRequests.get(body.player.userId);

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
      // console.log("Player left", );
      // console.log(body.trivia);
      // players: Player[];
      // question: string;
      // correctAnswer: string;
      // options: string[];
      // round: number;
      // body.trivia.question = room.questions[room.round].question;
      // body.trivia.correctAnswer = room.questions[room.round].correct_answer;
      client.in(body.roomId).emit('playerLeft', { room: body.trivia, players: room.players });
      this.rooms.set(body.roomId, room);
    }
    // TODO: If the player leaves during waiting state then just filter array
    // TODO: But if the player leaves during the match just mark as inactive/left

    // Emit to the room that player has left
    client.leave(body.roomId);
  }
}
