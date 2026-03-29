import { Router } from "express";
import { prisma } from "../prisma";
import { generateToken } from "../auth";
import { notify } from "../discord";

const GROUP_SECRET = process.env.GROUP_SECRET || "resenha";

export const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  try {
    const { username, pin } = req.body;

    if (!username || username.trim().length < 2 || username.trim().length > 50) {
      res.status(400).json({ error: "Username deve ter entre 2 e 50 caracteres" });
      return;
    }

    if (!pin || !/^\d{4}$/.test(pin)) {
      res.status(400).json({ error: "PIN deve ter exatamente 4 dígitos" });
      return;
    }

    const existing = await prisma.appUser.findUnique({
      where: { username: username.trim() },
    });

    if (existing) {
      if (existing.pin !== pin) {
        res.status(401).json({ error: "PIN incorreto" });
        return;
      }

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
      data: { username: username.trim(), pin, token: generateToken() },
    });

    await notify(`🆕 **${user.username}** entrou no ResenhaGenerator!`);

    res.json({
      user: { id: user.id, username: user.username, token: user.token },
      alreadyExisted: false,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: String(err) });
  }
});

userRouter.post("/reset-pin", async (req, res) => {
  try {
    const { username, secret } = req.body;

    if (!username || username.trim().length === 0) {
      res.status(400).json({ error: "Username é obrigatório" });
      return;
    }

    if (!secret || secret !== GROUP_SECRET) {
      res.status(401).json({ error: "Senha do grupo incorreta" });
      return;
    }

    const user = await prisma.appUser.findUnique({
      where: { username: username.trim() },
    });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const newPin = String(Math.floor(1000 + Math.random() * 9000));

    await prisma.appUser.update({
      where: { id: user.id },
      data: { pin: newPin, token: generateToken() },
    });

    await notify(`🔑 **${user.username}** resetou o PIN.`);

    res.json({ newPin });
  } catch (err) {
    console.error("Reset PIN error:", err);
    res.status(500).json({ error: String(err) });
  }
});
