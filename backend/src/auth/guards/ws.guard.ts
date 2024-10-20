import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { jwtConstants } from '../constants';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log("here guard");
    if (context.getType() !== 'ws') return true;

    // const client: Socket = context.switchToWs().getClient();

    // const { authorization } = client.handshake.headers;

    // WsJwtGuard.validateToken(client, this.jwtService);

    return true;
  }

  static validateToken(client: Socket, jwtService: JwtService) {
    const { authorization } = client.handshake.headers;

    const [type, token] = authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      const payload = jwtService.verify(token, {
        secret: jwtConstants.secret,
      });

      client['user'] = payload;

      
      // console.log(client);
      return payload;
    }
    throw new Error('Unauthorized request or token expired.');
  }
}
