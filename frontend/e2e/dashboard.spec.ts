import { test, expect } from './fixtures/auth';

test.describe('DashboardPage', () => {
  test.describe('unauthenticated', () => {
    test('shows "Connexion requise" message', async ({
      unauthenticatedPage: page,
    }) => {
      await page.goto('/dashboard');

      await expect(
        page.getByRole('heading', { name: 'Connexion requise' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Se connecter' }),
      ).toBeVisible();
    });
  });

  test.describe('authenticated (buyer/seller)', () => {
    test('shows greeting with user name', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/dashboard');

      await expect(page.getByText('Bonjour, Jean')).toBeVisible();
    });

    test('displays role badges', async ({ authenticatedPage: page }) => {
      await page.goto('/dashboard');

      await expect(page.getByText(/buyer/)).toBeVisible();
      await expect(page.getByText(/seller/)).toBeVisible();
    });

    test('shows purchase card', async ({ authenticatedPage: page }) => {
      await page.goto('/dashboard');

      await expect(
        page.getByRole('heading', { name: /Mes achats/ }),
      ).toBeVisible();
    });

    test('shows seller cards (Mes ventes, Publier)', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/dashboard');

      await expect(
        page.getByRole('heading', { name: /Mes ventes/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: /Publier un article/ }),
      ).toBeVisible();
    });

    test('"Publier" link navigates to /publish', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/dashboard');

      await page.getByRole('link', { name: 'Publier' }).click();
      await expect(page).toHaveURL(/\/publish/);
    });

    test('shows notifications and messages cards', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/dashboard');

      await expect(
        page.getByRole('heading', { name: /Notifications/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: /Messages/ }),
      ).toBeVisible();
    });

    test('shows profile card', async ({ authenticatedPage: page }) => {
      await page.goto('/dashboard');

      await expect(
        page.getByRole('heading', { name: /Mon profil/ }),
      ).toBeVisible();
    });
  });
});
