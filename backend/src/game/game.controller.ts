import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventGateway } from 'src/event/event.gateway';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService, private readonly eventGateway: EventGateway) {}

  @Get('joinRoom')
  joinRoom() {

    // this.eventGateway.emitToClients('joinRoom', {id: 1});
    console.log('JOINED ROOM');
  }
}
