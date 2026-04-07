import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../middleware/auth";
import { redis, connectRedis } from "../lib/redis";

const router = Router();

// GET /v1/tracks — Return all published learning tracks
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    await connectRedis();
    if (redis.isOpen) {
      const cached = await redis.get("deploykaro:tracks");
      if (cached) {
        return res.json({ tracks: JSON.parse(cached) });
      }
    }

    const tracks = await prisma.track.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        modules: { orderBy: { order: "asc" }, include: { concepts: { orderBy: { order: "asc" } } } },
        achievement: true,
      },
    });

    if (redis.isOpen) {
      await redis.setEx("deploykaro:tracks", 3600, JSON.stringify(tracks));
    }
    
    res.json({ tracks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch tracks." } });
  }
});

export default router;
