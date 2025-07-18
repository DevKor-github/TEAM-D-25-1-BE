import jwt, { SignOptions, VerifyErrors } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export interface JwtPayload {
  uid: string;
}

export function sign(payload: JwtPayload, options?: SignOptions): string {
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verify<T = JwtPayload>(token: string): T {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (err) {
    throw err;
  }
}
