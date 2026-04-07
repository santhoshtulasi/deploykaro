import { test, expect } from '@playwright/test';

test.describe('Mentor Chat Interface', () => {
  test('should send a message and receive a mocked AI response', async ({ page }) => {
    // Intercept API calls to match what the Mentor AI sends back.
    await page.route('**/mentor/chat', async route => {
      const resp = `data: Hello! This is a mocked streaming response.\n\n`;
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: resp
      });
    });

    await page.goto('http://localhost:3000/mentor');

    const chatInput = page.locator('textarea');
    await expect(chatInput).toBeVisible();

    const testMessage = 'Hello Buddy, what is AWS?';
    await chatInput.fill(testMessage);

    const sendButton = page.locator('button', { hasText: '' }).nth(0); // Temporary fix for send button locator
    await page.keyboard.press('Enter');

    // Verify the AI response appeared
    await expect(page.getByText(/Hello! This is a mocked streaming response./i)).toBeVisible({ timeout: 15000 });
  });
});
