import { test, expect } from './fixtures/auth';
import { mockProducts } from './mocks/catalog';

const product = mockProducts[0]; // Figurine Star Wars Darth Vader

function mockProductAPI(page: import('@playwright/test').Page) {
  return page.route(`**/api/catalog/products/${product.id}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(product),
    }),
  );
}

test.describe('ProductDetailPage', () => {
  test.describe('unauthenticated', () => {
    test('displays product information', async ({
      unauthenticatedPage: page,
    }) => {
      await mockProductAPI(page);
      await page.goto(`/catalog/${product.id}`);

      await expect(
        page.getByRole('heading', { name: product.title }),
      ).toBeVisible();
      await expect(page.getByText(`${Number(product.price).toFixed(2)} €`)).toBeVisible();
      await expect(page.getByText(product.description)).toBeVisible();
      await expect(page.getByText(product.category.name)).toBeVisible();
      await expect(page.getByText(`État : ${product.condition}`)).toBeVisible();
    });

    test('shows shipping cost', async ({ unauthenticatedPage: page }) => {
      await mockProductAPI(page);
      await page.goto(`/catalog/${product.id}`);

      await expect(
        page.getByText(`${Number(product.shippingCost).toFixed(2)} € de livraison`),
      ).toBeVisible();
    });

    test('shows login button when unauthenticated', async ({
      unauthenticatedPage: page,
    }) => {
      await mockProductAPI(page);
      await page.goto(`/catalog/${product.id}`);

      await expect(
        page.getByRole('button', { name: 'Se connecter pour acheter' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Acheter/ }),
      ).toBeHidden();
    });
  });

  test.describe('authenticated', () => {
    test('shows buy and contact buttons when authenticated', async ({
      authenticatedPage: page,
    }) => {
      await mockProductAPI(page);
      await page.goto(`/catalog/${product.id}`);

      await expect(
        page.getByRole('button', { name: /Acheter/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Contacter le vendeur/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Se connecter pour acheter' }),
      ).toBeHidden();
    });
  });

  test('shows not found for unknown product', async ({
    unauthenticatedPage: page,
  }) => {
    await page.route('**/api/catalog/products/unknown-id', (route) =>
      route.fulfill({ status: 404, body: '' }),
    );
    await page.goto('/catalog/unknown-id');

    await expect(page.getByText('Article non trouvé')).toBeVisible();
  });
});
