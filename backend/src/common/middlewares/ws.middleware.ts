import { JwtService } from "@nestjs/jwt"
import { Socket } from "socket.io"
import { WsJwtGuard } from "src/auth/guards/ws.guard"


export type SocketIOMiddleware={
    (client: Socket, next: (err?: Error) => void)
}

export const SocketAuthMiddleware = (jwtService: JwtService):SocketIOMiddleware => {
    return (client, next) => {
        try{
            WsJwtGuard.validateToken(client, jwtService);
            next();
        }catch(err){
            next(err)
        }
    }
}