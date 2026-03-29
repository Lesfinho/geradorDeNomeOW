import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../auth";
import { notify } from "../discord";
import { suggestNames } from "../markov";

export const nameRouter = Router();

nameRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name } = req.body;

    if (!name || name.trim().length === 0 || name.trim().length > 12) {
      res.status(400).json({ error: "Nome deve ter entre 1 e 12 caracteres" });
      return;
    }

    const entry = await prisma.nameEntry.create({
      data: { name: name.trim(), addedById: user.id },
      include: { addedBy: true },
    });

    res.json({
      id: entry.id,
      name: entry.name,
      isUsed: entry.isUsed,
      addedBy: entry.addedBy.username,
      drawnBy: null,
    });
  } catch (err) {
    console.error("Add name error:", err);
    res.status(500).json({ error: String(err) });
  }
});

nameRouter.post("/draw", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    const result = await prisma.$queryRawUnsafe<Array<{ id: number }>>(
      `UPDATE name_entry SET "isUsed" = true, "drawnById" = $1
       WHERE id = (
         SELECT id FROM name_entry WHERE "isUsed" = false
         ORDER BY RANDOM() LIMIT 1 FOR UPDATE SKIP LOCKED
       ) RETURNING id`,
      user.id
    );

    if (!result || result.length === 0) {
      res.json({ name: null, empty: true });
      return;
    }

    const entry = await prisma.nameEntry.findUnique({
      where: { id: result[0].id },
      include: { addedBy: true, drawnBy: true },
    });

    await notify(`🎲 **${user.username}** sorteou o nome **${entry!.name}**!`);

    res.json({
      name: {
        id: entry!.id,
        name: entry!.name,
        isUsed: entry!.isUsed,
        addedBy: entry!.addedBy.username,
        drawnBy: entry!.drawnBy?.username ?? null,
      },
      empty: false,
    });
  } catch (err) {
    console.error("Draw error:", err);
    res.status(500).json({ error: String(err) });
  }
});

nameRouter.get("/all", authMiddleware, async (_req, res) => {
  try {
    const entries = await prisma.nameEntry.findMany({
      include: { addedBy: true, drawnBy: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      entries.map((e) => ({
        id: e.id,
        name: e.name,
        isUsed: e.isUsed,
        addedBy: e.addedBy.username,
        drawnBy: e.drawnBy?.username ?? null,
      }))
    );
  } catch (err) {
    console.error("List all error:", err);
    res.status(500).json({ error: String(err) });
  }
});

nameRouter.get("/suggest", authMiddleware, async (_req, res) => {
  try {
    const entries = await prisma.nameEntry.findMany({ select: { name: true } });
    const names = entries.map((e) => e.name);
    const suggestions = suggestNames(names, 5);

    res.json({ suggestions, minReached: names.length >= 10, total: names.length });
  } catch (err) {
    console.error("Suggest error:", err);
    res.status(500).json({ error: String(err) });
  }
});

nameRouter.get("/stats", async (_req, res) => {
  try {
    const [available, total] = await Promise.all([
      prisma.nameEntry.count({ where: { isUsed: false } }),
      prisma.nameEntry.count(),
    ]);

    res.json({ available, total });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: String(err) });
  }
});
