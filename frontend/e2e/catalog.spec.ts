import { test, expect } from './fixtures/auth';
import { mockProducts, mockCategories } from './mocks/catalog';

function mockCatalogAPI(
  page: import('@playwright/test').Page,
  products = mockProducts,
  categories = mockCategories,
) {
  return Promise.all([
    page.route('**/api/catalog/products*', (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search')?.toLowerCase();
      const categoryId = url.searchParams.get('categoryId');

      let filtered = [...products];
      if (search) {
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search),
        );
      }
      if (categoryId) {
        filtered = filtered.filter((p) => p.category.id === categoryId);
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(filtered),
      });
    }),
    page.route('**/api/catalog/categories*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(categories),
      }),
    ),
  ]);
}

test.describe('CatalogPage', () => {
  test('displays product list', async ({ unauthenticatedPage: page }) => {
    await mockCatalogAPI(page);
    await page.goto('/catalog');

    await expect(page.getByRole('heading', { name: 'Catalogue' })).toBeVisible();

    for (const product of mockProducts) {
      await expect(page.getByText(product.title)).toBeVisible();
    }
  });

  test('shows empty state when no products', async ({
    unauthenticatedPage: page,
  }) => {
    await mockCatalogAPI(page, [], mockCategories);
    await page.goto('/catalog');

    await expect(page.getByText('Aucun article trouvé')).toBeVisible();
  });

  test('search input filters products', async ({
    unauthenticatedPage: page,
  }) => {
    await mockCatalogAPI(page);
    await page.goto('/catalog');

    await expect(page.getByText('Figurine Star Wars Darth Vader')).toBeVisible();

    const searchInput = page.getByPlaceholder('Rechercher un article...');
    await searchInput.fill('Pink Floyd');

    await expect(page.getByText('Vinyle Pink Floyd')).toBeVisible();
    await expect(page.getByText('Figurine Star Wars Darth Vader')).toBeHidden();
  });

  test('category filter filters products', async ({
    unauthenticatedPage: page,
  }) => {
    await mockCatalogAPI(page);
    await page.goto('/catalog');

    const categorySelect = page.locator('select');
    await categorySelect.selectOption({ label: 'Sneakers' });

    await expect(page.getByText('Nike Air Jordan')).toBeVisible();
    await expect(page.getByText('Figurine Star Wars Darth Vader')).toBeHidden();
  });

  test('clicking a product navigates to its detail page', async ({
    unauthenticatedPage: page,
  }) => {
    await mockCatalogAPI(page);
    // Also mock the product detail endpoint for navigation
    await page.route('**/api/catalog/products/prod-1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts[0]),
      }),
    );

    await page.goto('/catalog');
    await page.getByText('Figurine Star Wars Darth Vader').click();

    await expect(page).toHaveURL(/\/catalog\/prod-1/);
  });
});
