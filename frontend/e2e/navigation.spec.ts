import { test, expect } from './fixtures/auth';
import { mockProducts, mockCategories } from './mocks/catalog';

function mockCatalogAPI(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route('**/api/catalog/products*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      }),
    ),
    page.route('**/api/catalog/categories*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCategories),
      }),
    ),
  ]);
}

test.describe('Navigation & Header', () => {
  test.describe('unauthenticated', () => {
    test('logo navigates to home', async ({ unauthenticatedPage: page }) => {
      await mockCatalogAPI(page);
      await page.goto('/catalog');

      await page.getByRole('link', { name: /Collector\.shop/ }).click();
      await expect(page).toHaveURL('/');
    });

    test('"Catalogue" link navigates to /catalog', async ({
      unauthenticatedPage: page,
    }) => {
      await mockCatalogAPI(page);
      await page.goto('/');

      await page.getByRole('link', { name: 'Catalogue', exact: true }).click();
      await expect(page).toHaveURL(/\/catalog/);
    });

    test('shows Connexion and Inscription buttons', async ({
      unauthenticatedPage: page,
    }) => {
      await page.goto('/');

      await expect(
        page.getByRole('button', { name: 'Connexion' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Inscription' }),
      ).toBeVisible();
    });

    test('does not show "Mon Espace" or "Déconnexion"', async ({
      unauthenticatedPage: page,
    }) => {
      await page.goto('/');

      await expect(page.getByRole('link', { name: 'Mon Espace' })).toBeHidden();
      await expect(
        page.getByRole('button', { name: 'Déconnexion' }),
      ).toBeHidden();
    });
  });

  test.describe('authenticated (buyer/seller)', () => {
    test('shows "Mon Espace", user name and "Déconnexion"', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/');

      await expect(
        page.getByRole('link', { name: 'Mon Espace' }),
      ).toBeVisible();
      await expect(page.getByText('Jean')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Déconnexion' }),
      ).toBeVisible();
    });

    test('does not show "Admin" link for non-admin', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/');

      await expect(page.getByRole('link', { name: 'Admin' })).toBeHidden();
    });

    test('does not show Connexion/Inscription buttons', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/');

      await expect(
        page.getByRole('button', { name: 'Connexion', exact: true }),
      ).toBeHidden();
      await expect(
        page.getByRole('button', { name: 'Inscription', exact: true }),
      ).toBeHidden();
    });
  });

  test.describe('authenticated (admin)', () => {
    test('shows "Admin" link', async ({ adminPage: page }) => {
      await page.goto('/');

      await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    });
  });
});
