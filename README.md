# 🏆 Collector.shop

Plateforme de vente d'objets de collection entre particuliers — Architecture Microservices

## Architecture

```
┌─────────┐     ┌──────────┐     ┌──────────────────────┐
│ Frontend │────▶│ Gateway  │────▶│ Microservices (x7)   │
│ React/TS │     │  Nginx   │     │ NestJS / TypeScript  │
└─────────┘     └──────────┘     └──────────┬───────────┘
                     │                       │
                ┌────▼────┐          ┌───────▼───────┐
                │Keycloak │          │  PostgreSQL   │
                │  Auth   │          │ (Schemas sep.)│
                └─────────┘          └───────────────┘
```

## Stack technique

| Composant | Technologie |
|-----------|------------|
| Frontend | React 18, TypeScript, Vite, Axios |
| Backend | NestJS, TypeScript, TypeORM |
| Auth | Keycloak 24 (PKCE + JWT) |
| BDD | PostgreSQL 16 |
| Gateway | Nginx |
| Chat | Socket.IO (WebSocket) |
| Paiement | Stripe (simulé) |
| Conteneurs | Docker + Docker Compose |
| Orchestration | Kubernetes / Minikube |
| CI/CD | GitHub Actions |

## Microservices

| Service | Port | Rôle |
|---------|------|------|
| User | 3001 | Profils, préférences, centres d'intérêt |
| Catalog | 3002 | Produits, catégories, boutiques, filtrage contenu |
| Order | 3003 | Commandes, commission 5%, notation |
| Payment | 3004 | Paiement CB (Stripe), transactions |
| Notification | 3005 | Notifications in-app + email |
| Chat | 3006 | Messagerie temps réel (WebSocket) |
| Fraud | 3007 | Détection anomalies prix, vendeurs suspects |

## Démarrage rapide

### Prérequis
- Docker & Docker Compose
- Node.js 20+

### Lancement local
```bash
# Démarrer toute la stack
docker-compose up --build

# Accès :
# - Application:  http://localhost
# - Keycloak:     http://localhost:8080 (admin/admin)
```

### Utilisateurs de test
| Email | Mot de passe | Rôles |
|-------|-------------|-------|
| admin@collector.shop | admin123 | admin, buyer, seller |
| buyer@test.com | test123 | buyer |
| seller@test.com | test123 | buyer, seller |

### Déploiement Minikube
```bash
chmod +x scripts/deploy-minikube.sh
./scripts/deploy-minikube.sh
```

## Structure du projet

```
BLOC3CollectorShop/
├── frontend/          # React SPA
├── gateway/           # Nginx reverse proxy
├── keycloak/          # Realm config + Dockerfile
├── services/          # 7 microservices NestJS
│   ├── user-service/
│   ├── catalog-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── chat-service/
│   └── fraud-service/
├── k8s/               # Manifestes Kubernetes
├── scripts/           # Scripts utilitaires
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yml
```
