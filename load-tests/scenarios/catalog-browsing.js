import http from 'k6/http';
import { group } from 'k6';
import { SERVICES, THRESHOLDS, getScenarioConfig } from '../lib/config.js';
import {
  checkResponse,
  randomItem,
  randomInt,
  thinkTime,
} from '../lib/helpers.js';

const scenarioConfig = getScenarioConfig();

export const options = {
  ...scenarioConfig,
  thresholds: {
    ...THRESHOLDS,
    'http_req_duration{endpoint:products}': ['p(95)<800'],
    'http_req_duration{endpoint:product_detail}': ['p(95)<500'],
    'http_req_duration{endpoint:categories}': ['p(95)<400'],
    'http_req_duration{endpoint:search}': ['p(95)<1000'],
  },
};

const CATALOG = SERVICES.catalog;

const searchTerms = [
  'figurine',
  'manga',
  'carte',
  'pokemon',
  'collector',
  'rare',
  'vintage',
  'marvel',
  'star wars',
  'dragon ball',
];

export default function () {
  let productIds = [];
  let categoryIds = [];

  group('Browse categories', () => {
    const res = http.get(`${CATALOG}/categories`, {
      tags: { endpoint: 'categories' },
    });

    if (checkResponse(res, 'List categories') && res.status === 200) {
      try {
        const categories = JSON.parse(res.body);
        if (Array.isArray(categories) && categories.length > 0) {
          categoryIds = categories.map((c) => c.id);
        }
      } catch (_) {}
    }

    thinkTime(1, 3);
  });

  group('Browse products', () => {
    let url = `${CATALOG}/products`;
    if (categoryIds.length > 0 && Math.random() > 0.5) {
      url += `?categoryId=${randomItem(categoryIds)}`;
    }

    const res = http.get(url, {
      tags: { endpoint: 'products' },
    });

    if (checkResponse(res, 'List products') && res.status === 200) {
      try {
        const products = JSON.parse(res.body);
        const items = Array.isArray(products) ? products : products.data || [];
        if (items.length > 0) {
          productIds = items.map((p) => p.id);
        }
      } catch (_) {}
    }

    thinkTime(2, 5);
  });

  group('View product detail', () => {
    if (productIds.length === 0) return;

    const viewCount = randomInt(1, 3);
    for (let i = 0; i < viewCount; i++) {
      const productId = randomItem(productIds);
      const res = http.get(`${CATALOG}/products/${productId}`, {
        tags: { endpoint: 'product_detail' },
      });

      checkResponse(res, `Product detail ${productId}`);
      thinkTime(3, 8);
    }
  });

  group('Search products', () => {
    const term = randomItem(searchTerms);
    const res = http.get(`${CATALOG}/products?search=${encodeURIComponent(term)}`, {
      tags: { endpoint: 'search' },
    });

    checkResponse(res, `Search "${term}"`);
    thinkTime(2, 4);
  });
}
