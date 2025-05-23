import { 
  Injectable, 
  ExecutionContext, 
  UnauthorizedException 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FirebaseAuthGuard extends AuthGuard('firebase-auth') {
  handleRequest(err: any, user: any, info: Error, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('유효하지 않은 Firebase 토큰입니다.');
    }
    return user;
  }
}