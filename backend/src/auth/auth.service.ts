import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Tokens } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(
    username: string,
    email: string,
    password: string,
    confirmPassowrd: string,
  ): Promise<Tokens> {
    if (password !== confirmPassowrd) throw new BadRequestException();

    try {
      const user = this.userRepository.create({
        username,
        email,
        password,
      });

      await this.userRepository.save(user);

      const tokens = await this.generateTokens(
        user.id,
        user.username,
        user.email,
        user.role,
      );
      return tokens;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async signIn(username: string, userPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const passwordMatched = await user.isMatch(userPassword);

    if (!passwordMatched) throw new NotFoundException('Wrong credentials.');

    const tokens = await this.generateTokens(
      user.id,
      user.username,
      user.email,
      user.role,
    );

    user.refreshToken = tokens.refreshToken;

    await this.userRepository.save(user);

    const modifiedUser = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return { tokens, modifiedUser };
  }

  async guestSignIn() {
    const guestUser = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      role: 'guest',
    };

    const payload = { sub: guestUser.id, role: guestUser.role };
    const token = await this.jwtService.signAsync(payload, { expiresIn: '1h' });

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    const decodedToken = await this.jwtService.verifyAsync(refreshToken, {
      secret: jwtConstants.secret,
    });

    const user = await this.userRepository.findOneBy({ id: decodedToken.sub });

    if (!user) throw new NotFoundException('User not found or invalid token');

    if (refreshToken !== user.refreshToken)
      throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(
      user.id,
      user.username,
      user.email,
      user.role,
    );

    user.refreshToken = tokens.refreshToken;

    await this.userRepository.save(user);

    return tokens;
  }

  async generateTokens(
    userId: string,
    username: string,
    email: string,
    role: string,
  ): Promise<Tokens> {
    const payload = {
      sub: userId,
      username,
      email,
      role,
    };

    const [accessToken, refreshToken]: [string, string] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
