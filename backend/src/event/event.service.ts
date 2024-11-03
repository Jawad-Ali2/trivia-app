import { Injectable } from '@nestjs/common';
import { Player, Room, RoomStates, ScoreUpdateDTO } from './dto/room.dto';
import { Socket } from 'socket.io';
import {
  calculateScore,
  getQuestions,
  getShuffledOptions,
} from 'src/common/utils';

@Injectable()
export class EventService {
  async joinRoom(
    client: Socket,
    rooms: Map<string, Room>,
    roomId: string,
    player: Player,
    roomSize: number,
  ) {
    const room = rooms.get(roomId);

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
      gameResult: {
        ...room.gameResult,
        playersPerformance: [
          ...(room.gameResult?.playersPerformance || []),
          {
            userId: player.userId,
            username: player.username,
            averageTimePerRound: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            finalPosition: 0,
            rounds: [],
            totalScore: 0,
          },
        ],
      },
    });

    client.join(roomId);
    // TODO: Make constant of each room event seperately
    client.emit('roomJoined', {
      roomId,
      players: rooms.get(roomId).players,
      roomSize,
      questionNo: rooms.get(roomId).currentQuestionNo,
    }); // Sending emit to the user himself for array updation
    client.in(roomId).emit('playerJoined', {
      players: rooms.get(roomId).players,
      questionNo: rooms.get(roomId).currentQuestionNo,
    });

    console.log('Joined the lobby.', player.username);

    if (rooms.get(roomId).players.length === rooms.get(roomId).maxPlayers) {
      // const response = await axios.get('https://opentdb.com/api.php?amount=5');
      const fetchedQuestions = await getQuestions(
        rooms.get(roomId).questionsPerRound,
      );

      room.questions[room.round] = fetchedQuestions;

      // let data: any;
      // const data = response.data;

      // ! Dummy data for testing
      // setTimeout(() => {
      // if (room.round === 1) {
      //   data = {
      //     response_code: 0,
      //     results: [
      //       {
      //         type: 'boolean',
      //         difficulty: 'easy',
      //         category: 'Entertainment: Board Games',
      //         question:
      //           'There is a Donald Trump Board Game, which was made in 1989.',
      //         correct_answer: 'True',
      //         incorrect_answers: ['False'],
      //       },
      //       {
      //         type: 'multiple',
      //         difficulty: 'hard',
      //         category: 'General Knowledge',
      //         question:
      //           'Which of the following is an existing family in &quot;The Sims&quot;?',
      //         correct_answer: 'The Goth Family',
      //         incorrect_answers: [
      //           'The Family',
      //           'The Simoleon Family',
      //           'The Proud Family',
      //         ],
      //       },
      //       {
      //         type: 'boolean',
      //         difficulty: 'medium',
      //         category: 'History',
      //         question:
      //           'Adolf Hitler was accepted into the Vienna Academy of Fine Arts.',
      //         correct_answer: 'False',
      //         incorrect_answers: ['True'],
      //       },
      //       {
      //         type: 'multiple',
      //         difficulty: 'easy',
      //         category: 'Entertainment: Video Games',
      //         question:
      //           'Which Greek letter represents the &quot;Half-Life&quot; logo?',
      //         correct_answer: 'Lambda',
      //         incorrect_answers: ['Omega', 'Alpha', 'Sigma'],
      //       },
      //       {
      //         type: 'multiple',
      //         difficulty: 'medium',
      //         category: 'Entertainment: Musicals &amp; Theatres',
      //         question:
      //           'In Jeff Wayne&#039;s Musical Version of War of the Worlds, the chances of anything coming from Mars are...',
      //         correct_answer: 'A million to one',
      //         incorrect_answers: [
      //           'A billion to one',
      //           'A trillion to one',
      //           'A hundred to one',
      //         ],
      //       },
      //     ],
      //   };
      // } else {
      //   data = {
      //     response_code: 0,
      //     results: [
      //       {
      //         type: 'multiple',
      //         difficulty: 'easy',
      //         category: 'Entertainment: Video Games',
      //         question:
      //           'What year did the game &quot;Overwatch&quot; enter closed beta?',
      //         correct_answer: '2015',
      //         incorrect_answers: ['2013', '2011', '2016'],
      //       },
      //       {
      //         type: 'multiple',
      //         difficulty: 'medium',
      //         category: 'History',
      //         question: 'When did construction of the Suez Canal finish?',
      //         correct_answer: '1869',
      //         incorrect_answers: ['1859', '1860', '1850'],
      //       },
      //       {
      //         type: 'multiple',
      //         difficulty: 'medium',
      //         category: 'Geography',
      //         question:
      //           'Which of the following language families is the most controversial amongst modern linguists?',
      //         correct_answer: 'Altaic',
      //         incorrect_answers: [
      //           'Sino-Tibetan',
      //           'Dravidian',
      //           'Indo-European',
      //         ],
      //       },
      //       {
      //         type: 'multiple',
      //         difficulty: 'medium',
      //         category: 'Entertainment: Video Games',
      //         question:
      //           'In &quot;Call Of Duty: Zombies&quot;, completing which map&#039;s main easter egg will reward you with the achievement, &quot;Little Lost Girl&quot;?',
      //         correct_answer: 'Origins',
      //         incorrect_answers: ['Revelations', 'Moon', 'Tranzit'],
      //       },
      //       {
      //         type: 'multiple',
      //         difficulty: 'medium',
      //         category: 'Entertainment: Musicals &amp; Theatres',
      //         question:
      //           'The World Chess Championship in Chess, Act 1 is set in which Italian city?',
      //         correct_answer: 'Merano',
      //         incorrect_answers: ['Venice', 'Milan', 'Rome'],
      //       },
      //     ],
      //   };
      // }

      // room.questions[room.round] = data.results;

      rooms.set(roomId, {
        ...rooms.get(roomId),
        questions: room.questions,
        state: RoomStates.IN_PROGRESS,
      });

      console.log(
        'The game has started with players.',
        rooms.get(roomId).players.map((u) => u.username),
      );

      const options = getShuffledOptions(
        fetchedQuestions[0].incorrect_answers,
        fetchedQuestions[0].correct_answer,
      );

      client.emit('startGame', {
        roomId: roomId,
        players: rooms.get(roomId).players,
        question: rooms.get(roomId).questions[rooms.get(roomId).round][0],
        options,
        questionNo: rooms.get(roomId).currentQuestionNo,
      }); // Emitting this to current user
      client.in(roomId).emit('startGame', {
        roomId: roomId,
        players: rooms.get(roomId).players,
        question: rooms.get(roomId).questions[rooms.get(roomId).round][0],
        options,
        questionNo: rooms.get(roomId).currentQuestionNo,
      }); // Emitting this to inform all other users except the current one.
      // }, 3000);

      /*
       * I have two options now
       * Either send all the questions to the client (but maybe user can do tricks to see future questions)
       * Or send one question everytime each user has answered one question (Slow but better than above one)
       *
       * Going with option 2 for now
       */
    }
  }

  createRoom(
    client: Socket,
    rooms: Map<string, Room>,
    player: Player,
    roomSize: number,
    maxRounds: number = 2,
    questionsPerRound: number = 5,
  ) {
    const roomId: string = crypto.randomUUID();

    console.log('User has request to create lobby.', player.username);

    rooms.set(roomId, {
      players: [player],
      sockets: [client.id],
      questions: [],
      playerAnswers: [],
      maxPlayers: roomSize,
      state: RoomStates.WAITING,
      round: 0,
      currentQuestionNo: 0,
      maxRounds: maxRounds - 1,
      questionsPerRound: questionsPerRound - 1,
      gameResult: {
        roomId: roomId,
        playersPerformance: [
          {
            userId: player.userId,
            username: player.username,
            averageTimePerRound: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            finalPosition: 0,
            rounds: [],
            totalScore: 0,
          },
        ],
        totalRounds: maxRounds,
        endTime: null,
      },
    });

    client.emit('roomJoined', {
      roomId,
      players: rooms.get(roomId).players,
      roomSize,
      questionNo: rooms.get(roomId).currentQuestionNo,
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

  async submitQuestion({
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
    rooms,
  }: ScoreUpdateDTO & { client: Socket; rooms: Map<string, Room> }) {
    const room = rooms.get(roomId);
    const score = calculateScore(isCorrect, totalTime - timeTaken);

    // Update user's score and other stats (Positions & stores the record of each answer)
    const { playersAnsweredCount, disconnectedPlayers } = this.updateUserScore(
      room,
      score,
      userId,
      optionSelected,
      isCorrect,
      timeTaken,
      totalTime,
      questionIndex,
    );

    console.log(
      'Players Answered Count',
      playersAnsweredCount,
      disconnectedPlayers,
    );
    // If all the players have answered the question
    if (room.maxPlayers === playersAnsweredCount + disconnectedPlayers) {
      room.players.forEach((player) => {
        player.answered = false;
      });

      // This function updates the room state and sends next question or round
      await this.sendNextQuestionOrRound({
        rooms,
        room,
        trivia,
        roomId,
        client,
      });
    }

    if (room.round <= room.maxRounds) {
      trivia.round = room.round;
      trivia.questionNo = room.currentQuestionNo;
    }
    rooms.set(roomId, room);

    client.emit('scoreUpdate', { players: room.players, room: trivia });
    client
      .in(roomId)
      .emit('scoreUpdate', { players: room.players, room: trivia });
  }

  updateUserScore(
    room: Room,
    score: number,
    userId: string,
    optionSelected: string,
    isCorrect: boolean,
    timeTaken: number,
    totalTime: number,
    questionIndex: number,
  ) {
    let playersAnsweredCount = 0;
    let disconnectedPlayers = 0;
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

        // For keeping record of each answer
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

      if (player.status === 'left') disconnectedPlayers++;
      if (player.answered) playersAnsweredCount++;

      room.players.sort((a: Player, b: Player) => b.score - a.score); // Sort players based on score

      room.players.forEach((player: Player, index: number) => {
        // Update player position
        player.position = index + 1;
      });
    });

    return { playersAnsweredCount, disconnectedPlayers };
  }

  async sendNextQuestionOrRound({ rooms, room, trivia, roomId, client }) {
    console.log('INSIDE SUBMIT', rooms);
    if (room.currentQuestionNo < room.questionsPerRound) {
      // Preparing next question
      const options = getShuffledOptions(
        room.questions[room.round][room.currentQuestionNo + 1]
          .incorrect_answers,
        room.questions[room.round][room.currentQuestionNo + 1].correct_answer,
      );
      // Todo: Maybe just emit nextRound and update the states in it so we don't have to emit scoreUpdate even after round finishes.....
      trivia.correctAnswer =
        room.questions[room.round][room.currentQuestionNo + 1].correct_answer;
      trivia.options = options;
      trivia.players = room.players;
      trivia.question =
        room.questions[room.round][room.currentQuestionNo + 1].question;
      room.currentQuestionNo++;

      client.emit('nextQuestion', {
        roomId: roomId,
        players: room.players,
        question: room.questions[room.round][room.currentQuestionNo],
        options,
        round: room.round,
        questionNo: room.currentQuestionNo,
      });
      client.in(roomId).emit('nextQuestion', {
        roomId: roomId,
        players: room.players,
        question: room.questions[room.round][room.currentQuestionNo],
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
        room.gameResult.winningPlayer = room.gameResult.playersPerformance.find(
          (player) => player.finalPosition === 1,
        );

        client.emit('gameEnded', { results: room.gameResult });
        client.in(roomId).emit('gameEnded', { results: room.gameResult });
        console.log('Game ended brother!');
      } else {
        const fetchedQuestions = await getQuestions(
          rooms.get(roomId).questionsPerRound,
        );

        room.questions[room.round] = fetchedQuestions;

        console.log(
          room.questions[room.round][room.currentQuestionNo].question,
        );
        const options = getShuffledOptions(
          room.questions[room.round][room.currentQuestionNo].incorrect_answers,
          room.questions[room.round][room.currentQuestionNo].correct_answer,
        );

        trivia.correctAnswer =
          room.questions[room.round][room.currentQuestionNo].correct_answer;
        trivia.options = options;
        trivia.players = room.players;
        trivia.question =
          room.questions[room.round][room.currentQuestionNo].question;

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
          question: fetchedQuestions[room.currentQuestionNo],
          options,
          round: room.round,
          questionNo: room.currentQuestionNo,
        });
        client.in(roomId).emit('nextRound', {
          roomId: roomId,
          players: room.players,
          question: fetchedQuestions[room.currentQuestionNo],
          options,
          round: room.round,
          questionNo: room.currentQuestionNo,
        });
      }
    }
  }
}
