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

  // GET /v1/user/stats - Get aggregated learning and interview stats for Dashboard
router.get("/stats", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { cognitoId: userId }
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch Learning Plans
    const plans = await (prisma as any).learningPlan.findMany({
      where: { userId: user.id },
      include: { steps: true }
    });

    const totalPlans = plans.length;
    let totalSteps = 0;
    let completedSteps = 0;
    let completedPlans = 0;
    const toolFrequency: Record<string, number> = {};

    plans.forEach((p: any) => {
      totalSteps += p.steps?.length || 0;
      completedSteps += p.completedSteps?.length || 0;
      if (p.steps?.length > 0 && p.completedSteps?.length === p.steps?.length) {
        completedPlans += 1;
      }
      p.tools?.forEach((t: any) => { toolFrequency[t] = (toolFrequency[t] || 0) + 1; });
    });
    
    const topTool = Object.entries(toolFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Fetch Interview Sessions
    const sessions = await (prisma as any).interviewSession.findMany({
      where: { userId: user.id },
      include: { answers: { include: { question: true } } },
      orderBy: { startTime: "desc" }
    });

    const totalSessions = sessions.length;
    let avgScore = 0;
    let bestScore = 0;
    let trend: "up" | "down" | "flat" = "flat";
    let weakCategories: string[] = [];

    if (totalSessions > 0) {
      // Calculate scores dynamically (assuming debriefRatings: ✅ = 1, 🟡 = 0.5, ❌ = 0)
      const scores = sessions.map((s: any) => {
        if (s.answers.length === 0) return 0;
        let score = 0;
        s.answers.forEach((a: any) => {
          if (a.debriefRating === "✅") score += 1;
          else if (a.debriefRating === "🟡") score += 0.5;
        });
        return Math.round((score / s.answers.length) * 100);
      });

      avgScore = Math.round(scores.reduce((a: any, b: any) => a + b, 0) / scores.length);
      bestScore = Math.max(...scores);

      if (scores.length >= 2) {
        if (scores[0] > scores[1]) trend = "up";
        else if (scores[0] < scores[1]) trend = "down";
      }

      // Calculate weak categories
    const categoryMap: Record<string, { total: number; needs_work: number }> = {};
      sessions.forEach((s: any) => {
        s.answers.forEach((a: any) => {
          const cat = a.question?.category || "General";
          if (!categoryMap[cat]) categoryMap[cat] = { total: 0, needs_work: 0 };
          categoryMap[cat].total += 1;
          if (a.debriefRating === "❌" || a.debriefRating === "🟡") {
            categoryMap[cat].needs_work += 1;
          }
        });
      });

      weakCategories = Object.entries(categoryMap)
        .filter(([, v]) => v.total > 0 && v.needs_work / v.total > 0.4)
        .map(([cat]) => cat)
        .slice(0, 3);
    }

    res.json({
      success: true,
      learning: { totalPlans, completedPlans, totalSteps, completedSteps, topTool },
      interviews: { totalSessions, avgScore, bestScore, trend, weakCategories },
      recentPlans: plans.slice(0, 5).map((p: any) => ({
        id: p.id,
        project_title: p.projectTitle,
        cloud_provider: p.cloudProvider,
        app_type: p.appType,
        completed_steps: p.completedSteps,
        last_accessed: p.lastAccessed,
        steps: p.steps?.map((s: any) => ({ step_number: s.stepNumber })) || []
      })),
      recentSessions: sessions.slice(0, 6).map((s: any) => ({
        id: s.id,
        domain: s.domain,
        duration_min: s.durationMin,
        completed_at: s.startTime,
        answered: s.answers.length,
        score_pct: s.answers.length > 0 ? Math.round((s.answers.filter((a: any) => a.debriefRating === '✅').length / s.answers.length) * 100) : 0
      }))
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

export default router;
