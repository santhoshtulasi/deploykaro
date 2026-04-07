import { test, expect, request } from "@playwright/test";

// API smoke tests — validate real API endpoints respond correctly
// Run these with live services (docker-compose up + npm run dev for content + mentor-ai)
// They are tagged with [api] for selective runs: playwright test --grep @api

const CONTENT_API = "http://localhost:3001";
const MENTOR_AI = "http://localhost:8000";

test.describe("Content Service API Smoke Tests @api", () => {
    test("Health check returns service info", async () => {
        const ctx = await request.newContext();
        const res = await ctx.get(`${CONTENT_API}/`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty("service");
        expect(body.service).toContain("DeployKaro");
        expect(body.status).toBe("healthy");
    });

    test("GET /v1/tracks returns track list without auth (should 401)", async () => {
        const ctx = await request.newContext();
        const res = await ctx.get(`${CONTENT_API}/v1/tracks`);
        // Without auth token, should return 401 or redirect
        expect([401, 403, 302]).toContain(res.status());
    });
});

test.describe("Mentor AI Service Smoke Tests @api", () => {
    test("FastAPI root or docs endpoint is reachable", async () => {
        const ctx = await request.newContext();
        // FastAPI auto-generates /docs
        const res = await ctx.get(`${MENTOR_AI}/docs`);
        expect(res.status()).toBe(200);
    });

    test("POST /mentor/chat validates request body (400 on empty)", async () => {
        const ctx = await request.newContext();
        const res = await ctx.post(`${MENTOR_AI}/mentor/chat`, {
            data: { message: "", persona: "buddy-english", context: {}, history: [] },
            headers: { "Content-Type": "application/json" },
        });
        // Either 400 (validation) or 200 with error stream — service should not crash
        expect([200, 400, 422]).toContain(res.status());
    });

    test("POST /mentor/review-resume endpoint exists", async () => {
        const ctx = await request.newContext();
        const res = await ctx.post(`${MENTOR_AI}/mentor/review-resume`, {
            data: { resumeText: "", targetRole: "DevOps Engineer" },
            headers: { "Content-Type": "application/json" },
        });
        // Should return error JSON (no text) or 422 validation error — not 404
        expect(res.status()).not.toBe(404);
    });
});

test.describe("Frontend Health Smoke Tests @smoke", () => {
    test("Home page is reachable", async ({ page }) => {
        const res = await page.goto("/");
        expect(res?.status()).toBe(200);
        await expect(page).toHaveTitle(/DeployKaro/i);
    });

    test("Mentor page is reachable", async ({ page }) => {
        const res = await page.goto("/mentor");
        expect(res?.status()).toBe(200);
    });

    test("Onboarding page is reachable", async ({ page }) => {
        const res = await page.goto("/onboarding");
        expect(res?.status()).toBe(200);
    });

    test("No critical console errors on home page load", async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") errors.push(msg.text());
        });
        await page.goto("/");
        // Filter out expected non-critical errors (auth, network, hydration)
        const criticalErrors = errors.filter(e =>
            !e.includes("401") &&
            !e.includes("NetworkError") &&
            !e.includes("fetch") &&
            !e.includes("next-auth") &&
            !e.includes("session") &&
            !e.includes("NEXTAUTH") &&
            !e.includes("hydrat")
        );
        expect(criticalErrors).toHaveLength(0);
    });
});
