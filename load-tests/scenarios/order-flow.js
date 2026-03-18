import http from 'k6/http';
import { group } from 'k6';
import { SERVICES, THRESHOLDS, getScenarioConfig } from '../lib/config.js';
import {
  checkResponse,
  jsonHeaders,
  getAuthToken,
  randomItem,
  thinkTime,
} from '../lib/helpers.js';

const scenarioConfig = getScenarioConfig();

export const options = {
  ...scenarioConfig,
  thresholds: {
    ...THRESHOLDS,
    'http_req_duration{endpoint:create_order}': ['p(95)<2000'],
    'http_req_duration{endpoint:my_orders}': ['p(95)<1000'],
    'http_req_duration{endpoint:initiate_payment}': ['p(95)<2000'],
  },
};

export function setup() {
  const token = getAuthToken();
  if (!token) {
    console.warn('Could not obtain auth token – order tests will run unauthenticated');
  }
  return { token };
}

export default function (data) {
  const { token } = data;
  if (!token) return;

  const headers = jsonHeaders(token);

  group('Browse catalog before ordering', () => {
    const res = http.get(`${SERVICES.catalog}/products`, {
      tags: { endpoint: 'products' },
      ...headers,
    });
    checkResponse(res, 'List products');
    thinkTime(2, 4);
  });

  let productIds = [];
  group('Fetch available products', () => {
    const res = http.get(`${SERVICES.catalog}/products`, headers);
    if (res.status === 200) {
      try {
        const products = JSON.parse(res.body);
        const items = Array.isArray(products) ? products : products.data || [];
        productIds = items.filter((p) => p.status === 'approved').map((p) => p.id);
      } catch (_) {}
    }
  });

  if (productIds.length === 0) return;

  let orderId = null;

  group('Create order', () => {
    const payload = JSON.stringify({
      items: [{ productId: randomItem(productIds), quantity: 1 }],
    });

    const res = http.post(`${SERVICES.orders}`, payload, {
      ...headers,
      tags: { endpoint: 'create_order' },
    });

    if (checkResponse(res, 'Create order', 201) && res.status === 201) {
      try {
        orderId = JSON.parse(res.body).id;
      } catch (_) {}
    }

    thinkTime(1, 3);
  });

  group('View my orders', () => {
    const res = http.get(`${SERVICES.orders}/buyer/mine`, {
      ...headers,
      tags: { endpoint: 'my_orders' },
    });
    checkResponse(res, 'My orders');
    thinkTime(1, 2);
  });

  if (orderId) {
    group('Initiate payment', () => {
      const payload = JSON.stringify({
        orderId,
        amount: 1999,
      });

      const res = http.post(`${SERVICES.payments}/initiate`, payload, {
        ...headers,
        tags: { endpoint: 'initiate_payment' },
      });

      checkResponse(res, 'Initiate payment', 201);
      thinkTime(1, 2);
    });
  }
}
