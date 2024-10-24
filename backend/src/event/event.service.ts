import { Injectable } from '@nestjs/common';
import { Player, Room, RoomStates } from './dto/room.dto';
import { Socket } from 'socket.io';
import axios from 'axios';

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

    // const playerAlreadyJoined = room.players.includes(player.userId);

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
    });

    client.join(roomId);

    // TODO: Make constant of each room event seperately
    console.log(rooms.get(roomId).players)
    client.emit('roomJoined', {
      roomId,
      players: rooms.get(roomId).players,
      roomSize,
    }); // Sending emit to the user himself for array updation
    client
      .in(roomId)
      .emit('playerJoined', { players: rooms.get(roomId).players });

    console.log('Joined the lobby.', player.username);

    if (rooms.get(roomId).players.length === rooms.get(roomId).maxPlayers) {
      // const response = await axios.get('https://opentdb.com/api.php?amount=10');

      let data: any;

      // ! Dummy data for testing
      setTimeout(() => {
        data = {
          response_code: 0,
          results: [
            {
              type: 'boolean',
              difficulty: 'easy',
              category: 'Entertainment: Board Games',
              question:
                'There is a Donald Trump Board Game, which was made in 1989.',
              correct_answer: 'True',
              incorrect_answers: ['False'],
            },
            {
              type: 'boolean',
              difficulty: 'medium',
              category: 'History',
              question:
                'Adolf Hitler was accepted into the Vienna Academy of Fine Arts.',
              correct_answer: 'False',
              incorrect_answers: ['True'],
            },
            {
              type: 'multiple',
              difficulty: 'hard',
              category: 'General Knowledge',
              question:
                'Which of the following is an existing family in &quot;The Sims&quot;?',
              correct_answer: 'The Goth Family',
              incorrect_answers: [
                'The Family',
                'The Simoleon Family',
                'The Proud Family',
              ],
            },
            {
              type: 'multiple',
              difficulty: 'easy',
              category: 'Entertainment: Video Games',
              question:
                'Which Greek letter represents the &quot;Half-Life&quot; logo?',
              correct_answer: 'Lambda',
              incorrect_answers: ['Omega', 'Alpha', 'Sigma'],
            },
            {
              type: 'multiple',
              difficulty: 'medium',
              category: 'Entertainment: Musicals &amp; Theatres',
              question:
                'In Jeff Wayne&#039;s Musical Version of War of the Worlds, the chances of anything coming from Mars are...',
              correct_answer: 'A million to one',
              incorrect_answers: [
                'A billion to one',
                'A trillion to one',
                'A hundred to one',
              ],
            },
            {
              type: 'multiple',
              difficulty: 'easy',
              category: 'Entertainment: Video Games',
              question:
                'What year did the game &quot;Overwatch&quot; enter closed beta?',
              correct_answer: '2015',
              incorrect_answers: ['2013', '2011', '2016'],
            },
            {
              type: 'multiple',
              difficulty: 'medium',
              category: 'History',
              question: 'When did construction of the Suez Canal finish?',
              correct_answer: '1869',
              incorrect_answers: ['1859', '1860', '1850'],
            },
            {
              type: 'multiple',
              difficulty: 'medium',
              category: 'Geography',
              question:
                'Which of the following language families is the most controversial amongst modern linguists?',
              correct_answer: 'Altaic',
              incorrect_answers: ['Sino-Tibetan', 'Dravidian', 'Indo-European'],
            },
            {
              type: 'multiple',
              difficulty: 'medium',
              category: 'Entertainment: Video Games',
              question:
                'In &quot;Call Of Duty: Zombies&quot;, completing which map&#039;s main easter egg will reward you with the achievement, &quot;Little Lost Girl&quot;?',
              correct_answer: 'Origins',
              incorrect_answers: ['Revelations', 'Moon', 'Tranzit'],
            },
            {
              type: 'multiple',
              difficulty: 'medium',
              category: 'Entertainment: Musicals &amp; Theatres',
              question:
                'The World Chess Championship in Chess, Act 1 is set in which Italian city?',
              correct_answer: 'Merano',
              incorrect_answers: ['Venice', 'Milan', 'Rome'],
            },
          ],
        };

        rooms.set(roomId, {
          ...rooms.get(roomId),
          questions: data.results,
          state: RoomStates.IN_PROGRESS,
        });

        console.log(
          'The game has started with players.',
          rooms.get(roomId).players.map((u) => u.username),
        );

        const options = [];
        data.results[0].incorrect_answers.forEach((incorrectAnswer : string) => {
          options.push(incorrectAnswer);
        });
        options.push(data.results[0].correct_answer);

        client.emit('startGame', {
          roomId: roomId,
          players: rooms.get(roomId).players,
          question: rooms.get(roomId).questions[rooms.get(roomId).round],
          options,
        }); // Emitting this to current user
        client.in(roomId).emit('startGame', {
          roomId: roomId,
          players: rooms.get(roomId).players,
          question: rooms.get(roomId).questions[rooms.get(roomId).round],
          options,
        }); // Emitting this to inform all other users except the current one.
      }, 3000);

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
    // player: any,
    roomSize: number,
  ) {
    const roomId: string = crypto.randomUUID();

    console.log('User has request to create lobby.', player.username);

    rooms.set(roomId, {
      players: [player],
      sockets: [client.id],
      questions: [],
      maxPlayers: roomSize,
      state: RoomStates.WAITING,
      round: 0,
    });

    client.emit('roomJoined', {
      roomId,
      players: rooms.get(roomId).players,
      roomSize,
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
