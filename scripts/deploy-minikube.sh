#!/bin/bash
# ============================================
# CollectorShop - Minikube Deployment Script
# ============================================

set -e

echo "🚀 Starting CollectorShop deployment on Minikube..."

# 1. Start Minikube (if not running)
if ! minikube status | grep -q "Running"; then
  echo "📦 Starting Minikube..."
  minikube start --memory=8192 --cpus=4 --driver=docker
fi

# 2. Enable required addons
echo "🔌 Enabling addons..."
minikube addons enable ingress
minikube addons enable metrics-server

# 3. Use Minikube's Docker daemon
echo "🐳 Configuring Docker..."
eval $(minikube docker-env)

# 4. Build all Docker images locally
echo "🔨 Building Docker images..."
docker build -t collector/gateway:latest ./gateway
docker build -t collector/frontend:latest ./frontend
docker build -t collector/keycloak:latest ./keycloak
docker build -t collector/user-service:latest ./services/user-service
docker build -t collector/catalog-service:latest ./services/catalog-service
docker build -t collector/order-service:latest ./services/order-service
docker build -t collector/payment-service:latest ./services/payment-service
docker build -t collector/notification-service:latest ./services/notification-service
docker build -t collector/chat-service:latest ./services/chat-service
docker build -t collector/fraud-service:latest ./services/fraud-service

# 5. Deploy to Kubernetes
echo "☸️  Deploying to Kubernetes..."
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/postgres/
echo "⏳ Waiting for PostgreSQL..."
kubectl rollout status deployment/postgres -n collector --timeout=120s

kubectl apply -f k8s/keycloak/
echo "⏳ Waiting for Keycloak..."
kubectl rollout status deployment/keycloak -n collector --timeout=180s

kubectl apply -f k8s/services/
kubectl apply -f k8s/user-service/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yml

# 6. Wait for all pods
echo "⏳ Waiting for all pods to be ready..."
kubectl wait --for=condition=Ready pods --all -n collector --timeout=300s

# 7. Display status
echo ""
echo "============================="
echo "✅ Deployment complete!"
echo "============================="
kubectl get pods -n collector
echo ""
echo "🌐 Access the app: $(minikube service gateway -n collector --url)"
echo "🔑 Keycloak admin: http://$(minikube ip):$(kubectl get svc keycloak -n collector -o jsonpath='{.spec.ports[0].nodePort}')"
echo ""
echo "💡 Add to /etc/hosts: $(minikube ip) collector.local"
