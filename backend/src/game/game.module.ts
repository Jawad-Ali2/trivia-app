import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { EventGateway } from 'src/event/event.gateway';
import { EventModule } from 'src/event/event.module';

@Module({
  controllers: [GameController],
  providers: [GameService],
  imports: [EventModule]
})
export class GameModule {}
