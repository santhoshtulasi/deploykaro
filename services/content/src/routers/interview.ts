/**
 * Interview Router — Content Service
 * All routes require a valid Keycloak Bearer token.
 *
 * Routes:
 *   GET  /v1/interview/questions          – Fetch filtered questions
 *   POST /v1/interview/sessions           – Create a session (auth required)
 *   POST /v1/interview/answers            – Save an answer (auth required)
 *   GET  /v1/interview/sessions/:id/summary – Return session summary (auth required)
 */

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, RequestWithUser } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// ─── GET /questions ─────────────────────────────────────────────────────────────
// Public — questions can be browsed without auth, but sessions require auth.
router.get("/questions", async (req: Request, res: Response) => {
  try {
    const domain = (req.query.domain as string) || "DevOps";
    const count = parseInt((req.query.count as string) || "10", 10);
    const difficultiesRaw = req.query.difficulties as string;

    const where: Record<string, unknown> = { domain };

    if (difficultiesRaw) {
      const difficulties = difficultiesRaw.split(",").map((d) => d.trim());
      where.difficulty = { in: difficulties };
    }

    const allMatching = await prisma.interviewQuestion.findMany({ where });
    const shuffled = [...allMatching].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    return res.json({
      domain,
      count: selected.length,
      questions: selected.map((q) => ({
        id: q.id,
        question: q.question,
        difficulty: q.difficulty,
        category: q.category,
        domain: q.domain,
      })),
    });
  } catch (err) {
    console.error("[Interview] GET /questions error:", err);
    return res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ─── POST /sessions ─────────────────────────────────────────────────────────────
// Auth required — userId comes from JWT, not request body.
router.post("/sessions", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  const { domain, experienceLevel, durationMin } = req.body;
  const cognitoId = req.user!.sub;

  if (!domain || !durationMin) {
    return res.status(400).json({ error: "domain and durationMin are required" });
  }

  try {
    // Find or create the user record from the JWT sub
    let user = await prisma.user.findFirst({ where: { cognitoId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: req.user!.email || `${cognitoId}@deploykaro.local`,
          cognitoId,
          displayName: "DeployKaro User",
        },
      });
    }

    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        mode: "interview",
        domain: domain || "DevOps",
        experienceLevel: experienceLevel || "intermediate",
        durationMin: Number(durationMin),
      },
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error("[Interview] POST /sessions error:", err);
    return res.status(500).json({ error: "Failed to create session" });
  }
});

// ─── POST /answers ───────────────────────────────────────────────────────────────
// Auth required — ensures answers are tied to real sessions.
router.post("/answers", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  const { sessionId, questionId, answerText, debriefRating } = req.body;

  if (!sessionId || !questionId) {
    return res.status(400).json({ error: "sessionId and questionId are required" });
  }

  try {
    const answer = await prisma.interviewAnswer.create({
      data: {
        sessionId,
        questionId: Number(questionId),
        answerText: answerText || "",
        debriefRating: debriefRating || null,
      },
    });
    return res.status(201).json(answer);
  } catch (err) {
    console.error("[Interview] POST /answers error:", err);
    return res.status(500).json({ error: "Failed to save answer" });
  }
});

// ─── GET /sessions/:id/summary ───────────────────────────────────────────────────
// Auth required.
router.get("/sessions/:id/summary", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;

  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: { answers: true },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const answers = session.answers;
    const ratingCounts: Record<string, number> = { "✅": 0, "🟡": 0, "❌": 0 };

    for (const a of answers) {
      const r = a.debriefRating;
      if (r === "✅" || r === "🟡" || r === "❌") {
        ratingCounts[r]++;
      }
    }

    return res.json({
      sessionId: session.id,
      domain: session.domain,
      durationMin: session.durationMin,
      totalQuestions: answers.length,
      ratingCounts,
    });
  } catch (err) {
    console.error("[Interview] GET /sessions/:id/summary error:", err);
    return res.status(500).json({ error: "Failed to fetch summary" });
  }
});

export default router;
