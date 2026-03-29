import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { prisma } from "./prisma";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  const user = await prisma.appUser.findUnique({ where: { token } });

  if (!user) {
    res.status(401).json({ error: "Token inválido" });
    return;
  }

  (req as any).user = user;
  next();
}
