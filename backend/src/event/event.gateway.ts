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
      const questionsPerRound = 5;
      const maxRounds = 2;

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
          this.rooms,
          player,
          roomSize,
          maxRounds,
          questionsPerRound,
        );
      }
    } finally {
      this.locks.delete(player.userId);
    }

    return { event: 'respone', data: 'Request Completed' };
    //  console.log(this.rooms);
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
    } = body;
    let playersAnsweredCount = 0;
    let disconnectedPlayer = 0;

    const room = this.rooms.get(roomId);
    console.log(
      'JJJJ',
      room.currentQuestionNo,
      questionIndex,
      room.questionsPerRound,
    );
    const score = calculateScore(isCorrect, totalTime - timeTaken);

    room.players.forEach((player) => {
      if (player.userId === userId) {
        // TODO: Change this line
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

        room.gameResult.playersPerformance.forEach((playerPerformance) => {
          if (playerPerformance.userId === player.userId) {
            playerPerformance.averageTimePerRound =
              (playerPerformance.averageTimePerRound * room.round +
                (totalTime - timeTaken)) /
              (room.round + 1);

            playerPerformance.correctAnswers = player.correctAnswers;
            playerPerformance.wrongAnswers = player.wrongAnswers;
            if (room.round === room.maxRounds) {
              playerPerformance.totalScore = player.score;
              playerPerformance.finalPosition = player.position;

              playerPerformance.status =
                player.status === 'playing' ? 'complete' : 'left';
            }

            // Checks first if the round changed or we have to push in an existing round
            const existingRound = playerPerformance.rounds.find(
              (response) => response.round === room.round,
            );

            const newQuestionRecord = {
              question: room.questions[room.round][questionIndex].question,
              selectedAnswer: optionSelected,
              isCorrect: isCorrect,
              timeTaken: timeTaken,
              scoreGained: score,
            };

            if (existingRound) {
              existingRound.questions.push(newQuestionRecord);
            } else {
              playerPerformance.rounds.push({
                round: room.round,
                questions: [newQuestionRecord],
              });
            }
          }
        });
      }

      if (player.status === 'left') disconnectedPlayer++;
      if (player.answered) playersAnsweredCount++;
    });

    room.players.sort((a, b) => b.score - a.score);

    room.players.forEach((player, index) => {
      player.position = index + 1;
    });

    if (room.maxPlayers === playersAnsweredCount + disconnectedPlayer) {
      // current round has finished
      // if(room.round ) // TODO: If the rounds equal to lobby rounds limit we finish the game

      room.players.forEach((player) => {
        player.answered = false;
      });

      const options = getShuffledOptions(
        room.questions[room.round][questionIndex].incorrect_answers,
        room.questions[room.round][questionIndex].correct_answer,
      );

      // Todo: Maybe just emit nextRound and update the states in it so we don't have to emit scoreUpdate even after round finishes.....
      trivia.correctAnswer =
        room.questions[room.round][questionIndex].correct_answer;
      trivia.options = options;
      trivia.players = room.players;
      trivia.question = room.questions[room.round][questionIndex].question;

      if (room.currentQuestionNo < room.questionsPerRound) {
        console.log(room.currentQuestionNo, room.questionsPerRound);
        room.currentQuestionNo++;

        client.emit('nextQuestion', {
          roomId: roomId,
          players: room.players,
          question: room.questions[room.round][questionIndex],
          options,
          round: room.round,
          questionNo: room.currentQuestionNo,
        });
        client.in(roomId).emit('nextQuestion', {
          roomId: roomId,
          players: room.players,
          question: room.questions[room.round][questionIndex],
          options,
          round: room.round,
          questionNo: room.currentQuestionNo,
        });
      } else {
        room.round++;
        room.currentQuestionNo = 0;

        if (room.round > room.maxRounds) {
          console.log(room.round, room.maxRounds);
          room.gameResult.endTime = new Date();
          room.gameResult.winningPlayer =
            room.gameResult.playersPerformance.find(
              (player) => player.finalPosition === 1,
            );

          // TODO: Handle end game logic
          // TODO: Show user's performance during each question (For this I have to prepare another state that keeps track of user's activity)
          // Send performance along too
          client.emit('gameEnded', { results: room.gameResult });
          client.in(roomId).emit('gameEnded', { results: room.gameResult });
          console.log('Game ended brother!');
        } else {
          const fetchedQuestions = await getQuestions(
            this.rooms.get(roomId).questionsPerRound,
          );

          room.questions[room.round] = fetchedQuestions;

          // Stop every player's countdown and let them know next round is starting
          client.emit('roundFinished', {
            roundFinished: true,
          });
          client.in(roomId).emit('roundFinished', {
            roundFinished: true,
          });
          // Emit next round announcement here
          client.emit('nextRound', {
            roomId: roomId,
            players: room.players,
            question: room.questions[room.round][room.currentQuestionNo],
            options,
            round: room.round,
            questionNo: room.currentQuestionNo,
          });
          client.in(roomId).emit('nextRound', {
            roomId: roomId,
            players: room.players,
            question: room.questions[room.round][room.currentQuestionNo],
            options,
            round: room.round,
            questionNo: room.currentQuestionNo,
          });
        }
      }
    }

    if (room.round <= room.maxRounds) {
      trivia.round = room.round;
      trivia.questionNo = room.currentQuestionNo;
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

    console.log('PLAYER REQUESTED TO LEAVE');
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
