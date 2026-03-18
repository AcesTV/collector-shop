import { test, expect } from './fixtures/auth';

test.describe('HomePage', () => {
  test.describe('unauthenticated', () => {
    test('displays hero section with title and CTA', async ({
      unauthenticatedPage: page,
    }) => {
      await page.route('**/api/catalog/**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        }),
      );

      await page.goto('/');

      await expect(page.getByText('Vos trésors de collection')).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Explorer le catalogue' }),
      ).toBeVisible();
    });

    test('"Explorer le catalogue" navigates to /catalog', async ({
      unauthenticatedPage: page,
    }) => {
      await page.route('**/api/catalog/**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        }),
      );

      await page.goto('/');
      await page.getByRole('link', { name: 'Explorer le catalogue' }).click();
      await expect(page).toHaveURL(/\/catalog/);
    });

    test('shows "Devenir vendeur" button when unauthenticated', async ({
      unauthenticatedPage: page,
    }) => {
      await page.goto('/');

      await expect(
        page.getByRole('button', { name: 'Devenir vendeur' }),
      ).toBeVisible();
    });

    test('displays the 3 feature cards', async ({
      unauthenticatedPage: page,
    }) => {
      await page.goto('/');

      await expect(page.getByText('Transactions sécurisées')).toBeVisible();
      await expect(page.getByText('Articles vérifiés')).toBeVisible();
      await expect(page.getByText('Chat intégré')).toBeVisible();
    });
  });

  test.describe('authenticated', () => {
    test('hides "Devenir vendeur" when authenticated', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/');

      await expect(page.getByText('Vos trésors de collection')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Devenir vendeur' }),
      ).toBeHidden();
    });
  });
});
