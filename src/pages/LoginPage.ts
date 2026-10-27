import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../config/env';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email address' });
  }

  get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.login);
    await expect(this.emailInput).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await expect(this.signInButton, 'Sign in should enable once both fields are filled').toBeEnabled();
    await this.signInButton.click();
    await expect(this.page, 'Sign in should land on the dashboard overview').toHaveURL(
      /\/#\/dashboard\/overview/,
      { timeout: 45_000 },
    );
  }
}
