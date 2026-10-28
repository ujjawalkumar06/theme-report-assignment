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

  get showPasswordButton(): Locator {
    return this.page.getByRole('button', { name: /Show Password|Hide Password/ });
  }

  get errorMessage(): Locator {
    return this.page.getByText('Incorrect email or password.', { exact: true });
  }

  get rememberMe(): Locator {
    return this.page.getByRole('checkbox', { name: 'Remember me' });
  }

  get forgotPasswordLink(): Locator {
    return this.page.getByRole('link', { name: 'Forgot password?' });
  }

  async loginExpectingError(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await expect(this.errorMessage).toBeVisible();
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
