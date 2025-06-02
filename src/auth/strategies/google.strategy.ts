import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-http-bearer";
import * as admin from "firebase-admin";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'firebase-google') {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: admin.app.App
  ) {
    super();
  }

  async validate(token: string) {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(token);
      if (!decodedToken.firebase || decodedToken.firebase.sign_in_provider !== "google.com") {
        throw new UnauthorizedException("Firebase provider is not google");
      }
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException("Invalid token provided");
    }
  }
}

export class GoogleAuthGuard extends AuthGuard('firebase-google') {}