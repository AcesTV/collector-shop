import http from 'k6/http';
import { check, group } from 'k6';
import { SERVICES, THRESHOLDS, getScenarioConfig } from '../lib/config.js';
import { errorRate, thinkTime } from '../lib/helpers.js';

const scenarioConfig = getScenarioConfig();

export const options = {
  ...scenarioConfig,
  thresholds: {
    ...THRESHOLDS,
    'http_req_duration{service:user}': ['p(95)<200'],
    'http_req_duration{service:catalog}': ['p(95)<200'],
    'http_req_duration{service:order}': ['p(95)<200'],
    'http_req_duration{service:payment}': ['p(95)<200'],
    'http_req_duration{service:notification}': ['p(95)<200'],
    'http_req_duration{service:chat}': ['p(95)<200'],
    'http_req_duration{service:fraud}': ['p(95)<200'],
  },
};

const services = [
  { name: 'user', url: SERVICES.users },
  { name: 'catalog', url: SERVICES.catalog },
  { name: 'order', url: SERVICES.orders },
  { name: 'payment', url: SERVICES.payments },
  { name: 'notification', url: SERVICES.notifications },
  { name: 'chat', url: SERVICES.chat },
  { name: 'fraud', url: SERVICES.fraud },
];

export default function () {
  for (const svc of services) {
    group(`Health check - ${svc.name}`, () => {
      const res = http.get(`${svc.url}/health`, {
        tags: { service: svc.name },
      });

      const passed = check(res, {
        [`${svc.name} is healthy`]: (r) => r.status === 200,
        [`${svc.name} responds in < 200ms`]: (r) => r.timings.duration < 200,
      });

      errorRate.add(!passed);
    });
  }

  thinkTime(0.5, 1);
}
