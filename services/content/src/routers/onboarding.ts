import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken, RequestWithUser } from "../middleware/auth";

const router = Router();

// POST /v1/onboarding/complete — Save user preferences after onboarding
router.post("/complete", verifyToken as any, async (req: RequestWithUser, res: Response) => {
  try {
    const { persona, language, slangLevel, email, displayName } = req.body;
    const cognitoId = req.user!.sub; // Fixed: using sub from updated auth middleware

    const validPersonas = ["BUDDY", "ANNA", "BHAI", "DIDI"];
    const validLanguages = ["ENGLISH", "TAMIL", "KANNADA", "TELUGU"];
    const validSlangLevels = ["LIGHT", "MEDIUM", "HEAVY"];

    if (!validPersonas.includes(persona)) {
      return res.status(400).json({ 
        error: { code: "INVALID_PERSONA", message: `Persona must be one of: ${validPersonas.join(", ")}.` } 
      });
    }

    const user = await prisma.user.upsert({
      where: { cognitoId },
      update: { 
        persona, 
        language: validLanguages.includes(language) ? language : undefined, 
        slangLevel: validSlangLevels.includes(slangLevel) ? slangLevel : undefined, 
        displayName 
      },
      create: {
        cognitoId,
        email: email || req.user!.email || `${cognitoId}@local.dev`,
        persona,
        language: validLanguages.includes(language) ? language : "ENGLISH",
        slangLevel: validSlangLevels.includes(slangLevel) ? slangLevel : "MEDIUM",
        displayName,
      },
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to save onboarding preferences." } });
  }
});

export default router;
