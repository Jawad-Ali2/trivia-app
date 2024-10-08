import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

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
})
export class DatabaseModule {}
