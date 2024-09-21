import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/constants';
import { Tokens } from './types/auth.types';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('confirmPassword') confirmPassword: string,
    @Res() res: Response,
  ) {
    const tokens: Tokens = await this.authService.signUp(
      username,
      email,
      password,
      confirmPassword,
    );

    res.cookie('at', tokens.accessToken);
    res.cookie('rt', tokens.refreshToken);

    return res.status(200).json({ message: 'Tokens set in cookies' });
  }

  @Public()
  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.signIn(username, password);

    res.cookie('at', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    res.cookie('rt', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res
      .status(200)
      .json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
  }

  @Public()
  @Post('guest-login')
  async guestLogin(@Res() res: Response) {
    const accessToken = await this.authService.guestSignIn();

    // Todo: Add options for the cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return;
  }

  @Post('refresh-token')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    // If a guest user tries to refresh token they immediately gets error and log em out
    if (!refreshToken) return;

    const tokens = await this.authService.refreshAccessToken(refreshToken);

    res.cookie('at', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    res.cookie('rt', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.status(200).json({ message: 'Tokens set in cookies' });
  }

  @Get('admin')
  @Roles(Role.Admin)
  getAdminDashboard() {
    return 'Admin Dashboard';
  }

  // @UseGuards(AuthGuard)
  // @Public()
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
