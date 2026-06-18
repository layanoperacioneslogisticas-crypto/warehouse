import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env.js";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export function signToken(payload: JwtPayload) {
  const secret: Secret = env.JWT_SECRET;
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
}
