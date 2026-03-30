import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { authMiddleware } from "../auth";
import { notify } from "../discord";
import { suggestCoupleNames, suggestNames } from "../markov";

export const nameRouter = Router();

nameRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name } = req.body;

    if (!name || name.trim().length === 0 || name.trim().length > 12) {
      res.status(400).json({ error: "Nome deve ter entre 1 e 12 caracteres" });
      return;
    }

    const cleanName = name.trim();
    const existing = await prisma.nameEntry.findFirst({
      where: { name: cleanName },
      select: { id: true },
    });

    if (existing) {
      res.status(409).json({ error: "Nome ja existe no pool" });
      return;
    }

    const entry = await prisma.nameEntry.create({
      data: { name: cleanName, addedById: user.id },
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
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      res.status(409).json({ error: "Nome ja existe no pool" });
      return;
    }
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

nameRouter.get("/duplicates", authMiddleware, async (_req, res) => {
  try {
    const duplicateGroups = await prisma.nameEntry.groupBy({
      by: ["name"],
      _count: { name: true },
      having: {
        name: {
          _count: {
            gt: 1,
          },
        },
      },
      orderBy: {
        _count: {
          name: "desc",
        },
      },
    });

    if (duplicateGroups.length === 0) {
      res.json({ duplicateNames: 0, duplicateEntries: 0, duplicates: [] });
      return;
    }

    const duplicateNames = duplicateGroups.map((group) => group.name);
    const entries = await prisma.nameEntry.findMany({
      where: { name: { in: duplicateNames } },
      include: { addedBy: true, drawnBy: true },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    });

    const entriesByName = new Map<string, typeof entries>();
    for (const entry of entries) {
      if (!entriesByName.has(entry.name)) {
        entriesByName.set(entry.name, []);
      }
      entriesByName.get(entry.name)!.push(entry);
    }

    const duplicates = duplicateGroups.map((group) => {
      const groupedEntries = entriesByName.get(group.name) ?? [];
      return {
        name: group.name,
        count: group._count.name,
        entries: groupedEntries.map((entry) => ({
          id: entry.id,
          isUsed: entry.isUsed,
          createdAt: entry.createdAt,
          addedBy: entry.addedBy.username,
          drawnBy: entry.drawnBy?.username ?? null,
        })),
      };
    });

    const duplicateEntries = duplicateGroups.reduce(
      (sum, group) => sum + (group._count.name - 1),
      0
    );

    res.json({
      duplicateNames: duplicateGroups.length,
      duplicateEntries,
      duplicates,
    });
  } catch (err) {
    console.error("List duplicates error:", err);
    res.status(500).json({ error: String(err) });
  }
});

nameRouter.get("/suggest", authMiddleware, async (_req, res) => {
  try {
    const entries = await prisma.nameEntry.findMany({ select: { name: true } });
    const names = entries.map((e) => e.name);
    const suggestions = suggestNames(names, 5);
    const couples = suggestCoupleNames(names, 5);

    res.json({ suggestions, couples, total: names.length });
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
