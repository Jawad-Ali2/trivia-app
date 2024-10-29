import { Injectable } from '@nestjs/common';
import { Player, Room, RoomStates } from './dto/room.dto';
import { Socket } from 'socket.io';
import axios from 'axios';
import { getQuestions, getShuffledOptions } from 'src/common/utils';

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

      // const data = response.data;

      // const data = { results: [] };

      /*
       * I have two options now
       * Either send all the questions to the client (but maybe user can do tricks to see future questions)
       * Or send one question everytime each user has answered one question (Slow but better than above one)
       *
       * Going with option 2 for now
       */

      // ! Uncomment when testing is done
      //   rooms.set(roomId, {
      //     ...rooms.get(roomId),
      //     questions: data.results,
      //     state: RoomStates.IN_PROGRESS,
      //   });

      //   const players = [];

      //   rooms.get(roomId).players.forEach((player) => {
      //     players.push({
      //       playerId: player.userId,
      //       username: player.username,
      //       status: player.status,
      //       score: '0',
      //       correctAnswers: 0,
      //       wrongAnswers: 0,
      //       position: '0',
      //     });
      //   });

      //   console.log(
      //     'The game has started with players.',
      //     players
      //     // rooms.get(roomId).players.map((u) => u.username),
      //   );

      //   client.emit('startGame', {
      //     roomId: roomId,
      //     players: players,
      //     question: rooms.get(roomId).questions[rooms.get(roomId).round],
      //   }); // Emitting this to current user
      //   client.in(roomId).emit('startGame', {
      //     roomId: roomId,
      //     players: players,
      //     question: rooms.get(roomId).questions[rooms.get(roomId).round],
      //   }); // Emitting this to inform all other users except the current one.
    }

    // return 'Joined a room!';
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
}
