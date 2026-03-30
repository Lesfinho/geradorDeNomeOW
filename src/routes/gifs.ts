import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../auth";

export const gifRouter = Router();
const prismaClient = prisma as any;

function isAllowedGifUrl(url: string): boolean {
  return (
    url.includes("media.discordapp.net") ||
    url.includes("cdn.discordapp.com/attachments/")
  );
}

gifRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "URL do GIF é obrigatória" });
      return;
    }

    const cleanUrl = url.trim();
    if (!isAllowedGifUrl(cleanUrl)) {
      res.status(400).json({
        error: "Aceita apenas gifs que tem 'media.discordapp.net' ou 'cdn.discordapp.com/attachments/'",
      });
      return;
    }

    const existing = await prismaClient.sharedGif.findUnique({ where: { url: cleanUrl } });
    if (existing) {
      res.status(409).json({ error: "Esse GIF já foi enviado" });
      return;
    }

    const created = await prismaClient.sharedGif.create({
      data: {
        url: cleanUrl,
        addedById: user.id,
      },
    });

    res.json({ id: created.id, url: created.url });
  } catch (err) {
    console.error("Add gif error:", err);
    res.status(500).json({ error: String(err) });
  }
});

gifRouter.get("/random", async (_req, res) => {
  try {
    const total = await prismaClient.sharedGif.count();
    if (total === 0) {
      res.json({ url: null, empty: true });
      return;
    }

    const skip = Math.floor(Math.random() * total);
    const randomGif = await prismaClient.sharedGif.findFirst({
      skip,
      select: { url: true },
    });

    res.json({ url: randomGif?.url ?? null, empty: !randomGif?.url });
  } catch (err) {
    console.error("Random gif error:", err);
    res.status(500).json({ error: String(err) });
  }
});
