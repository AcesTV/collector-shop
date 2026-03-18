# Tests de Charge - CollectorShop

Tests de performance et de charge utilisant [k6](https://k6.io/) pour valider la robustesse de la plateforme CollectorShop.

## Prérequis

- [k6](https://k6.io/docs/get-started/installation/) installé localement
- La plateforme CollectorShop en cours d'exécution (`docker compose up`)

## Structure

```
load-tests/
├── lib/
│   ├── config.js          # Configuration des scénarios (smoke, load, stress, spike)
│   └── helpers.js         # Fonctions utilitaires (auth, checks, métriques)
├── scenarios/
│   ├── health-checks.js   # Vérification santé de tous les services
│   ├── catalog-browsing.js # Navigation catalogue (produits, catégories, recherche)
│   ├── order-flow.js      # Flux de commande complet (authentifié)
│   ├── user-profile.js    # Gestion du profil utilisateur
│   ├── notifications.js   # Consultation des notifications
│   └── full-load.js       # Scénario mixte réaliste (tous les flux)
└── package.json           # Scripts npm pour lancer les tests
```

## Profils de charge

| Profil    | Description                                    | VUs max |
|-----------|------------------------------------------------|---------|
| **smoke** | Validation rapide (1 VU, 30s)                  | 1       |
| **load**  | Charge normale (rampe → 50 VUs, 5 min)         | 50      |
| **stress**| Montée en charge (rampe → 300 VUs, 9 min)      | 300     |
| **spike** | Pic soudain (500 VUs pendant 1 min)            | 500     |
| **full**  | Scénario mixte réaliste (100 VUs combinés)     | 100     |

## Utilisation

### Tests rapides (smoke)

```bash
# Vérifier la santé des services
npm run test:smoke:health

# Tester la navigation catalogue
npm run test:smoke:catalog
```

### Tests de charge

```bash
# Charge normale sur le catalogue
npm run test:load:catalog

# Charge normale sur le flux de commande
npm run test:load:orders
```

### Tests de stress et spike

```bash
# Stress test catalogue (jusqu'à 300 VUs)
npm run test:stress:catalog

# Spike test catalogue (pic à 500 VUs)
npm run test:spike:catalog
```

### Scénario complet mixte

```bash
# Simule un trafic réaliste avec tous les flux combinés
npm run test:full

# Avec export JSON des résultats
npm run test:full:json
```

### Configuration personnalisée

```bash
# URL de base personnalisée
k6 run --env BASE_URL=http://staging.collectorshop.com scenarios/catalog-browsing.js

# Avec authentification Keycloak
k6 run \
  --env KEYCLOAK_URL=http://localhost:8080 \
  --env KEYCLOAK_REALM=collector \
  --env TEST_USERNAME=testuser \
  --env TEST_PASSWORD=testpassword \
  scenarios/order-flow.js
```

## Seuils de performance

| Métrique                   | Seuil       |
|---------------------------|-------------|
| Temps de réponse (p95)    | < 500ms     |
| Temps de réponse (p99)    | < 1500ms    |
| Taux d'erreur             | < 5%        |
| Health checks (p95)       | < 200ms     |
| Recherche catalogue (p95) | < 1000ms    |
| Création commande (p95)   | < 2000ms    |

## Intégration CI

Les tests smoke sont exécutés automatiquement dans le pipeline CI via GitHub Actions. Les résultats sont disponibles en tant qu'artefact.
