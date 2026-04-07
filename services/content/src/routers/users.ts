import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, RequestWithUser } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// PATCH /v1/user/settings - Update user preferences (Expert Mode, etc.)
router.patch("/settings", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { expertMode, language, persona, slangLevel } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedUser = await prisma.user.update({
      where: { cognitoId: userId },
      data: {
        expertMode: expertMode !== undefined ? expertMode : undefined,
        language: language || undefined,
        persona: persona || undefined,
        slangLevel: slangLevel || undefined,
      },
    });

    res.json({
      success: true,
      expertMode: updatedUser.expertMode,
      persona: updatedUser.persona,
      language: updatedUser.language,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// GET /v1/user/profile - Get current user profile (includes xp + earned badges)
router.get("/profile", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { cognitoId: userId },
      select: {
        displayName: true,
        persona: true,
        language: true,
        expertMode: true,
        slangLevel: true,
        xp: true,
        achievements: {
          select: {
            earnedAt: true,
            achievement: { select: { slug: true, titleEn: true, badgeUrl: true } }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      ...user,
      achievements: user.achievements.map(ua => ({
        slug: ua.achievement.slug,
        titleEn: ua.achievement.titleEn,
        badgeUrl: ua.achievement.badgeUrl,
        earnedAt: ua.earnedAt,
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// GET /v1/user/achievements - Get all earned badges for the current user
router.get("/achievements", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { cognitoId: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const earned = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" }
    });

    res.json({
      success: true,
      achievements: earned.map(ua => ({
        slug: ua.achievement.slug,
        titleEn: ua.achievement.titleEn,
        descriptionEn: ua.achievement.descriptionEn,
        badgeUrl: ua.achievement.badgeUrl,
        earnedAt: ua.earnedAt,
      }))
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

// GET /v1/user/career-stats - Full career dashboard data (xp, per-track progress, achievement count)
router.get("/career-stats", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { cognitoId: userId },
      include: {
        progress: { include: { track: { select: { slug: true, titleEn: true } } } },
        achievements: true,
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const totalConceptsCompleted = user.progress.reduce(
      (acc, p) => acc + p.completedConcepts.length, 0
    );

    res.json({
      success: true,
      xp: user.xp,
      totalConceptsCompleted,
      achievementCount: user.achievements.length,
      trackProgress: user.progress.map(p => ({
        slug: p.track.slug,
        titleEn: p.track.titleEn,
        completedPct: Math.round(p.completedPct),
        completedConcepts: p.completedConcepts.length,
      })),
    });
  } catch (error) {
    console.error("Error fetching career stats:", error);
    res.status(500).json({ error: "Failed to fetch career stats" });
  }
});

// GET /v1/user/leaderboard - Get top 10 users by XP
router.get("/leaderboard", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const leaderboard = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 10,
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        xp: true,
      }
    });

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
