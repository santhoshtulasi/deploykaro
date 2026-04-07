import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken, RequestWithUser } from "../middleware/auth";

const router = Router();

// GET /v1/tracks/:trackId/progress - Get user's progress for a specific track
router.get("/:trackId/progress", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const cognitoId = req.user?.sub;
    const { trackId } = req.params;

    if (!cognitoId) return res.status(401).json({ error: "Unauthorized" });

    // Resolve internal userId
    const user = await prisma.user.findUnique({ where: { cognitoId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Look up track by slug (common in URLs) or ID
    const progress = await prisma.progress.findFirst({
      where: { 
          userId: user.id,
          track: { slug: trackId } 
      },
    });

    if (!progress) {
      return res.json({ completedPct: 0, completedConcepts: [] });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// POST /v1/tracks/:trackId/complete-concept - Mark a concept as completed + grant achievement at 100%
router.post("/:trackId/complete-concept", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const cognitoId = req.user?.sub;
    const { trackId } = req.params;
    const { conceptId } = req.body;

    if (!cognitoId) return res.status(401).json({ error: "Unauthorized" });

    // Resolve internal userId
    const user = await prisma.user.findUnique({ where: { cognitoId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get track with full concept tree + linked achievement
    const track = await prisma.track.findFirst({
      where: { OR: [{ slug: trackId }, { id: trackId }] },
      include: { 
        modules: { include: { concepts: true } }, 
        achievement: true 
      }
    });

    if (!track) return res.status(404).json({ error: "Track not found" });

    // 2. Fetch existing progress to check for new completions
    const currentProgress = await prisma.progress.findUnique({
      where: { userId_trackId: { userId: user.id, trackId: track.id } }
    });

    // 3. Filter for valid concept IDs only
    const allTrackConceptIds = track.modules.flatMap(m => m.concepts.map(c => c.id));
    const totalConcepts = allTrackConceptIds.length;
    
    let updatedConcepts = [...(currentProgress?.completedConcepts || [])];
    let xpEarned = 0;

    if (!updatedConcepts.includes(conceptId)) {
      updatedConcepts.push(conceptId);
      xpEarned = 10; // Grant 10 XP for new concept mastery
    }

    const validCompletedConcepts = updatedConcepts.filter(id => allTrackConceptIds.includes(id));
    const completedPct = Math.min((validCompletedConcepts.length / totalConcepts) * 100, 100);

    // 4. Update Progress and User XP in a transaction
    const [progress, updatedUser] = await prisma.$transaction([
      prisma.progress.upsert({
        where: { userId_trackId: { userId: user.id, trackId: track.id } },
        update: {
          completedConcepts: updatedConcepts,
          completedPct,
          lastConceptId: conceptId,
        },
        create: {
          userId: user.id,
          trackId: track.id,
          completedConcepts: updatedConcepts,
          completedPct,
          lastConceptId: conceptId,
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: xpEarned } }
      })
    ]);

    // ── Achievement Grant ─────────────────────────────────────────────
    // Grant badge when track is 100% complete and a badge is configured
    let achievementUnlocked: { slug: string; titleEn: string; badgeUrl: string } | null = null;

    if (completedPct === 100 && track.achievement) {
      const alreadyEarned = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId: user.id, achievementId: track.achievement.id } }
      });

      if (!alreadyEarned) {
        await prisma.userAchievement.create({
          data: { userId: user.id, achievementId: track.achievement.id }
        });
        achievementUnlocked = {
          slug: track.achievement.slug,
          titleEn: track.achievement.titleEn,
          badgeUrl: track.achievement.badgeUrl,
        };
      }
    }
    // ─────────────────────────────────────────────────────────────────

    res.json({ success: true, progress, xpEarned, totalXp: updatedUser.xp, achievementUnlocked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

export default router;
