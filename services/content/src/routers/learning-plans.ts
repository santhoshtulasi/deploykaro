import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken, RequestWithUser } from "../middleware/auth";

const router = Router();

// GET /v1/learning-plans — Fetch all plans for the authenticated user
router.get("/", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const cognitoId = req.user?.sub;
    if (!cognitoId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { cognitoId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const plans = await prisma.learningPlan.findMany({
      where: { userId: user.id },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
      },
      orderBy: { lastAccessed: "desc" },
    });

    res.json({ plans });
  } catch (error) {
    console.error("[LearningPlan] GET error:", error);
    res.status(500).json({ error: "Failed to fetch learning plans" });
  }
});

// POST /v1/learning-plans — Save a newly AI generated learning plan
router.post("/", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const cognitoId = req.user?.sub;
    if (!cognitoId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { cognitoId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const {
      app_type,
      cloud_provider,
      tools,
      project_title,
      architecture_summary,
      steps, // LearningPlanStep array
    } = req.body;

    const newPlan = await prisma.learningPlan.create({
      data: {
        userId: user.id,
        appType: app_type,
        cloudProvider: cloud_provider,
        tools: tools || [],
        projectTitle: project_title,
        architectureSummary: architecture_summary,
        steps: {
          create: steps.map((s: any) => ({
            stepNumber: s.step_number,
            title: s.title,
            description: s.description,
            actionableCommand: s.actionable_command || null,
            toolsUsed: s.tools_used || [],
            jargonTerms: s.jargon_terms || [],
          })),
        },
      },
      include: { steps: true },
    });

    res.status(201).json(newPlan);
  } catch (error) {
    console.error("[LearningPlan] POST error:", error);
    res.status(500).json({ error: "Failed to save learning plan" });
  }
});

// PATCH /v1/learning-plans/:id/progress — Update progress array
router.patch("/:id/progress", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const cognitoId = req.user?.sub;
    const { id } = req.params;
    const { completed_steps } = req.body; // Array of step numbers

    if (!cognitoId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { cognitoId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const plan = await prisma.learningPlan.findFirst({
      where: { id, userId: user.id },
    });

    if (!plan) return res.status(404).json({ error: "Learning plan not found" });

    // Update the completed steps array
    const updatedPlan = await prisma.learningPlan.update({
      where: { id },
      data: {
        completedSteps: completed_steps,
        lastAccessed: new Date(),
      },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
      },
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error("[LearningPlan] PATCH progress error:", error);
    res.status(500).json({ error: "Failed to update learning plan progress" });
  }
});

export default router;
