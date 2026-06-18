import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { signToken } from "../utils/jwt.js";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    throw new HttpError(401, "Credenciales invalidas.");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new HttpError(401, "Credenciales invalidas.");
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, active: true }
  });

  if (!user) {
    throw new HttpError(404, "Usuario no encontrado.");
  }
  return user;
}

