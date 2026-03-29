import { Router } from "express";
import { prisma } from "../prisma";

export const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  const { username } = req.body;

  if (!username || username.trim().length < 2 || username.trim().length > 50) {
    res.status(400).json({ error: "Username deve ter entre 2 e 50 caracteres" });
    return;
  }

  const existing = await prisma.appUser.findUnique({
    where: { username: username.trim() },
  });

  if (existing) {
    res.json({
      user: { id: existing.id, username: existing.username },
      alreadyExisted: true,
    });
    return;
  }

  const user = await prisma.appUser.create({
    data: { username: username.trim() },
  });

  res.json({
    user: { id: user.id, username: user.username },
    alreadyExisted: false,
  });
});
