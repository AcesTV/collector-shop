import http from 'k6/http';
import { group } from 'k6';
import { SERVICES, THRESHOLDS, getScenarioConfig } from '../lib/config.js';
import {
  checkResponse,
  jsonHeaders,
  getAuthToken,
  thinkTime,
} from '../lib/helpers.js';

const scenarioConfig = getScenarioConfig();

export const options = {
  ...scenarioConfig,
  thresholds: {
    ...THRESHOLDS,
    'http_req_duration{endpoint:notifications}': ['p(95)<500'],
    'http_req_duration{endpoint:unread_count}': ['p(95)<300'],
  },
};

export function setup() {
  const token = getAuthToken();
  if (!token) {
    console.warn('Could not obtain auth token – notification tests will run unauthenticated');
  }
  return { token };
}

export default function (data) {
  const { token } = data;
  if (!token) return;

  const headers = jsonHeaders(token);
  let notificationIds = [];

  group('Check unread count', () => {
    const res = http.get(`${SERVICES.notifications}/unread-count`, {
      ...headers,
      tags: { endpoint: 'unread_count' },
    });
    checkResponse(res, 'Unread count');
    thinkTime(0.5, 1);
  });

  group('List notifications', () => {
    const res = http.get(`${SERVICES.notifications}/mine`, {
      ...headers,
      tags: { endpoint: 'notifications' },
    });

    if (checkResponse(res, 'List notifications') && res.status === 200) {
      try {
        const notifications = JSON.parse(res.body);
        const items = Array.isArray(notifications) ? notifications : notifications.data || [];
        notificationIds = items.map((n) => n.id);
      } catch (_) {}
    }

    thinkTime(2, 4);
  });

  group('Mark notification as read', () => {
    if (notificationIds.length === 0) return;

    const id = notificationIds[0];
    const res = http.patch(`${SERVICES.notifications}/${id}/read`, null, {
      ...headers,
      tags: { endpoint: 'mark_read' },
    });
    checkResponse(res, 'Mark as read');
    thinkTime(1, 2);
  });

  group('Mark all as read', () => {
    const res = http.patch(`${SERVICES.notifications}/read-all`, null, {
      ...headers,
      tags: { endpoint: 'mark_all_read' },
    });
    checkResponse(res, 'Mark all read');
    thinkTime(1, 2);
  });
}
