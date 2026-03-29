import { Router } from "express";
import { prisma } from "../prisma";

export const nameRouter = Router();

nameRouter.post("/", async (req, res) => {
  const { name, userId } = req.body;

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: "Nome é obrigatório" });
    return;
  }

  if (!userId) {
    res.status(400).json({ error: "userId é obrigatório" });
    return;
  }

  const entry = await prisma.nameEntry.create({
    data: { name: name.trim(), addedById: userId },
    include: { addedBy: true },
  });

  res.json({
    id: entry.id,
    name: entry.name,
    isUsed: entry.isUsed,
    addedBy: entry.addedBy.username,
    drawnBy: null,
  });
});

nameRouter.post("/draw", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: "userId é obrigatório" });
    return;
  }

  // Race-safe random draw using raw SQL
  const result = await prisma.$queryRawUnsafe<Array<{ id: number }>>(
    `UPDATE name_entry SET "isUsed" = true, "drawnById" = $1
     WHERE id = (
       SELECT id FROM name_entry WHERE "isUsed" = false
       ORDER BY RANDOM() LIMIT 1 FOR UPDATE SKIP LOCKED
     ) RETURNING id`,
    userId
  );

  if (!result || result.length === 0) {
    res.json({ name: null, empty: true });
    return;
  }

  const entry = await prisma.nameEntry.findUnique({
    where: { id: result[0].id },
    include: { addedBy: true, drawnBy: true },
  });

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
});

nameRouter.get("/stats", async (_req, res) => {
  const [available, total] = await Promise.all([
    prisma.nameEntry.count({ where: { isUsed: false } }),
    prisma.nameEntry.count(),
  ]);

  res.json({ available, total });
});
