import { Router } from "express";
import { prisma } from "../prisma";
import { generateToken } from "../auth";

export const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 2 || username.trim().length > 50) {
      res.status(400).json({ error: "Username deve ter entre 2 e 50 caracteres" });
      return;
    }

    const existing = await prisma.appUser.findUnique({
      where: { username: username.trim() },
    });

    if (existing) {
      // Gera novo token ao "logar" de novo
      const updated = await prisma.appUser.update({
        where: { id: existing.id },
        data: { token: generateToken() },
      });

      res.json({
        user: { id: updated.id, username: updated.username, token: updated.token },
        alreadyExisted: true,
      });
      return;
    }

    const user = await prisma.appUser.create({
      data: { username: username.trim(), token: generateToken() },
    });

    res.json({
      user: { id: user.id, username: user.username, token: user.token },
      alreadyExisted: false,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: String(err) });
  }
});
