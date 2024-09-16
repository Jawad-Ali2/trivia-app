import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseController } from './database.controller';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      // port: 5432, // Default PostgreSQL port
      password: process.env.DATABASE_PASSWORD,
      username: process.env.DATABASE_USER,
      // entities: [User],
      autoLoadEntities: true,
      database: process.env.DATABASE_NAME,
      synchronize: true, // ! set false in production
      logging: ['error', 'schema'],
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  ],
  controllers: [DatabaseController],
  providers: [DatabaseService],
})
export class DatabaseModule {}
