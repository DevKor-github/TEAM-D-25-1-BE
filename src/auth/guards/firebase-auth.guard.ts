import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FirebaseAuthGuard extends AuthGuard([
  'firebase-auth',
  'firebase-google',
  'firebase-apple',
]) {
  handleRequest(err: any, user: any, info: Error, context: ExecutionContext) {
    if (err || !user) {
      throw (
        err || new UnauthorizedException('유효하지 않은 Firebase 토큰입니다.')
      );
    }
    if (!user.isOnboarded) {
      throw new ForbiddenException(
        '온보딩을 완료해야 서비스를 이용할 수 있습니다.',
      );
    }
    if (!user.isOnboarded) {
      throw new ForbiddenException(
        '온보딩을 완료해야 서비스를 이용할 수 있습니다.',
      );
    }
    return user;
  }
}
