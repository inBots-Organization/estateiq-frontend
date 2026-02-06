import { test, expect, Page } from '@playwright/test';

// Test fixtures
const testTrainee = {
  email: 'test.trainee@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'Trainee',
};

// Page Object Models
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async expectLoginError() {
    await expect(this.page.getByText(/invalid credentials|login failed/i)).toBeVisible();
  }
}

class DashboardPage {
  constructor(private page: Page) {}

  async expectToBeVisible() {
    await expect(this.page.getByText(/welcome back|dashboard/i)).toBeVisible();
  }

  async navigateToSimulations() {
    await this.page.getByRole('link', { name: /simulations/i }).click();
  }

  async getProgressPercentage(): Promise<number> {
    const progressText = await this.page.getByTestId('overall-progress').textContent();
    return parseInt(progressText?.replace('%', '') || '0');
  }
}

class SimulationPage {
  constructor(private page: Page) {}

  async expectToBeVisible() {
    await expect(this.page.getByText(/simulation|scenario/i)).toBeVisible();
  }

  async selectScenario(scenarioType: string) {
    const scenarioCard = this.page.locator(`[class*="cursor-pointer"]`).filter({ hasText: new RegExp(scenarioType.replace('_', ' '), 'i') });
    await scenarioCard.click();
  }

  async selectDifficulty(level: 'easy' | 'medium' | 'hard') {
    await this.page.getByText(new RegExp(`^${level}$`, 'i')).click();
  }

  async startSimulation() {
    await this.page.getByRole('button', { name: /start simulation/i }).click();
  }

  async waitForClientMessage() {
    await expect(this.page.locator('[class*="chat"], [class*="message"]').first()).toBeVisible({ timeout: 10000 });
  }

  async sendMessage(message: string) {
    const textarea = this.page.getByPlaceholder(/type|message|response/i);
    await textarea.fill(message);
    await this.page.getByRole('button', { name: /send/i }).click();
  }

  async waitForClientResponse() {
    // Wait for typing indicator to appear and disappear
    await this.page.waitForTimeout(2000);
  }

  async getConversationTurnCount(): Promise<number> {
    const messages = await this.page.locator('[class*="message"], [class*="bubble"]').all();
    return messages.length;
  }

  async endSimulation() {
    await this.page.getByRole('button', { name: /end|complete/i }).first().click();
  }

  async expectResultsVisible() {
    await expect(this.page.getByText(/results|score|analysis/i)).toBeVisible({ timeout: 30000 });
  }

  async getOverallScore(): Promise<number> {
    const scoreText = await this.page.getByText(/\d+%/).first().textContent();
    return parseInt(scoreText?.replace('%', '') || '0');
  }
}

// Test Suite
test.describe('Trainee Login to Simulation Flow', () => {
  test.describe('Authentication', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await loginPage.goto();
      await loginPage.login(testTrainee.email, testTrainee.password);

      await dashboardPage.expectToBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login('invalid@example.com', 'wrongpassword');

      await loginPage.expectLoginError();
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page).toHaveURL(/.*login/);
    });

    test('should persist session across page refreshes', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await loginPage.goto();
      await loginPage.login(testTrainee.email, testTrainee.password);
      await dashboardPage.expectToBeVisible();

      await page.reload();

      await dashboardPage.expectToBeVisible();
    });
  });

  test.describe('Navigation to Simulation', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testTrainee.email, testTrainee.password);
    });

    test('should navigate from dashboard to simulation page', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const simulationPage = new SimulationPage(page);

      await dashboardPage.navigateToSimulations();

      await simulationPage.expectToBeVisible();
    });

    test('should display available scenario types', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.navigateToSimulations();

      await expect(page.getByText(/property showing/i)).toBeVisible();
      await expect(page.getByText(/price negotiation/i)).toBeVisible();
      await expect(page.getByText(/objection handling/i)).toBeVisible();
    });

    test('should display difficulty levels', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.navigateToSimulations();

      await expect(page.getByText(/easy/i)).toBeVisible();
      await expect(page.getByText(/medium/i)).toBeVisible();
      await expect(page.getByText(/hard/i)).toBeVisible();
    });
  });

  test.describe('Simulation Session', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await loginPage.goto();
      await loginPage.login(testTrainee.email, testTrainee.password);
      await dashboardPage.navigateToSimulations();
    });

    test('should start simulation and receive initial client message', async ({ page }) => {
      const simulationPage = new SimulationPage(page);

      await simulationPage.selectScenario('property_showing');
      await simulationPage.selectDifficulty('easy');
      await simulationPage.startSimulation();

      await simulationPage.waitForClientMessage();
    });

    test('should exchange messages with AI client', async ({ page }) => {
      const simulationPage = new SimulationPage(page);

      await simulationPage.selectScenario('property_showing');
      await simulationPage.selectDifficulty('easy');
      await simulationPage.startSimulation();
      await simulationPage.waitForClientMessage();

      // Send first message
      await simulationPage.sendMessage('Hello! Welcome to the property. What brings you here today?');
      await simulationPage.waitForClientResponse();

      const turnCount = await simulationPage.getConversationTurnCount();
      expect(turnCount).toBeGreaterThanOrEqual(2);
    });

    test('should complete full simulation flow', async ({ page }) => {
      const simulationPage = new SimulationPage(page);

      await simulationPage.selectScenario('property_showing');
      await simulationPage.selectDifficulty('easy');
      await simulationPage.startSimulation();
      await simulationPage.waitForClientMessage();

      // Conduct conversation
      const messages = [
        'Hello! Welcome to the property showing. What features are you looking for?',
        'That sounds great. Let me show you the main living areas.',
        'The kitchen was recently renovated with modern appliances.',
      ];

      for (const message of messages) {
        await simulationPage.sendMessage(message);
        await simulationPage.waitForClientResponse();
      }

      // End simulation
      await simulationPage.endSimulation();
      await simulationPage.expectResultsVisible();
    });

    test('should display skill breakdown in results', async ({ page }) => {
      const simulationPage = new SimulationPage(page);

      // Complete quick simulation
      await simulationPage.selectScenario('first_contact');
      await simulationPage.selectDifficulty('easy');
      await simulationPage.startSimulation();
      await simulationPage.waitForClientMessage();

      await simulationPage.sendMessage('Hello! How can I help you today?');
      await simulationPage.waitForClientResponse();

      await simulationPage.endSimulation();
      await simulationPage.expectResultsVisible();

      // Verify skill scores are displayed
      await expect(page.getByText(/communication|skill/i)).toBeVisible();
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await loginPage.goto();
      await loginPage.login(testTrainee.email, testTrainee.password);
      await dashboardPage.expectToBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      const simulationPage = new SimulationPage(page);

      await loginPage.goto();
      await loginPage.login(testTrainee.email, testTrainee.password);
      await dashboardPage.navigateToSimulations();

      await simulationPage.selectScenario('property_showing');
      await simulationPage.selectDifficulty('easy');

      // Simulate network failure
      await page.route('**/api/simulations/**', route => route.abort());

      await simulationPage.startSimulation();

      // Should show error message
      await expect(page.getByText(/error|failed|try again/i)).toBeVisible({ timeout: 10000 });
    });

    test('should handle session timeout', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testTrainee.email, testTrainee.password);

      // Clear auth token to simulate timeout
      await page.evaluate(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth-storage');
      });

      await page.goto('/simulation');

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });
  });
});
