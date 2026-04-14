import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_CONTENT_API || "http://localhost:3001";
const AI_BASE = process.env.NEXT_PUBLIC_MENTOR_AI_URL || "http://localhost:8000";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = (session as any)?.accessToken || (session as any)?.idToken;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// ── User Stats & Dashboard ───────────────────────────────────────────────────

export async function getUserStats() {
  return fetchWithAuth(`${API_BASE}/v1/user/stats`);
}

export async function getUserProfile() {
  return fetchWithAuth(`${API_BASE}/v1/user/profile`);
}

// ── Learning Plans ───────────────────────────────────────────────────────────

export async function saveLearningPlan(planPayload: any) {
  // Save it to Postgres via Content API
  return fetchWithAuth(`${API_BASE}/v1/learning-plans`, {
    method: "POST",
    body: JSON.stringify(planPayload),
  });
}

export async function getLearningPlans() {
  const data = await fetchWithAuth(`${API_BASE}/v1/learning-plans`);
  return {
    plans: (data.plans || []).map((p: any) => ({
      id: p.id,
      app_type: p.appType,
      cloud_provider: p.cloudProvider,
      tools: p.tools,
      project_title: p.projectTitle,
      architecture_summary: p.architectureSummary,
      completed_steps: p.completedSteps,
      last_accessed: p.lastAccessed,
      steps: p.steps?.map((s: any) => ({
        step_number: s.stepNumber,
        title: s.title,
        description: s.description,
        actionable_command: s.actionableCommand,
        tools_used: s.toolsUsed,
        jargon_terms: s.jargonTerms
      })) || []
    }))
  };
}

export async function updateLearningPlanProgress(planId: string, completedStepNumbers: number[]) {
  return fetchWithAuth(`${API_BASE}/v1/learning-plans/${planId}/progress`, {
    method: "PATCH",
    body: JSON.stringify({ completed_steps: completedStepNumbers }),
  });
}

// ── Interviews ───────────────────────────────────────────────────────────────

export async function createInterviewSession(domain: string, durationMin: number, experienceLevel: string) {
  const session = await getSession();
  const userId = (session?.user as any)?.id || (session as any)?.sub; // Depending on how next-auth configures id
  
  return fetchWithAuth(`${API_BASE}/v1/interview/sessions`, {
    method: "POST",
    body: JSON.stringify({
      userId, 
      domain,
      experienceLevel,
      durationMin,
    }),
  });
}

export async function saveInterviewAnswer(sessionId: string, questionId: number, answerText: string, debriefRating: string) {
  return fetchWithAuth(`${API_BASE}/v1/interview/answers`, {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      questionId,
      answerText,
      debriefRating,
    }),
  });
}

// ── Curated Tracks ───────────────────────────────────────────────────────────

export async function getTracks() {
  return fetchWithAuth(`${API_BASE}/v1/tracks`);
}

export async function getTrackProgress(trackId: string) {
  return fetchWithAuth(`${API_BASE}/v1/tracks/${trackId}/progress`);
}

export async function completeTrackConcept(trackId: string, conceptId: string) {
  return fetchWithAuth(`${API_BASE}/v1/tracks/${trackId}/complete-concept`, {
    method: "POST",
    body: JSON.stringify({ conceptId })
  });
}
