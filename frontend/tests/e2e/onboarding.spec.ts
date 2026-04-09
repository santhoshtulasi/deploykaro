import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('unauthenticated user sees sign‑in prompt after completing onboarding', async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');
    // Wait for onboarding UI to load
    await expect(page.locator('text=Choose your persona')).toBeVisible({ timeout: 8000 }).catch(() => {});

    // Step 1: Welcome
    await page.getByPlaceholder('Enter your name').fill('Playwright Test');
    await page.getByRole('button', { name: /Begin Journey/i }).click();

    // Step 2: Persona
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Experience
    await page.getByRole('button', { name: /Finalize/i }).click();

    // The component should detect unauthenticated state and show the sign‑in prompt
    await expect(page.getByText(/Sign in to save your preferences/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In to Continue/i })).toBeVisible();
  });
});
