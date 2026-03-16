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
docker build -t ghcr.io/acestv/collector/collector-gateway:develop ./gateway
docker build -t ghcr.io/acestv/collector/collector-frontend:develop ./frontend
docker build -t ghcr.io/acestv/collector/collector-keycloak:develop ./keycloak
docker build -t ghcr.io/acestv/collector/collector-user-service:develop ./services/user-service
docker build -t ghcr.io/acestv/collector/collector-catalog-service:develop ./services/catalog-service
docker build -t ghcr.io/acestv/collector/collector-order-service:develop ./services/order-service
docker build -t ghcr.io/acestv/collector/collector-payment-service:develop ./services/payment-service
docker build -t ghcr.io/acestv/collector/collector-notification-service:develop ./services/notification-service
docker build -t ghcr.io/acestv/collector/collector-chat-service:develop ./services/chat-service
docker build -t ghcr.io/acestv/collector/collector-fraud-service:develop ./services/fraud-service

# 5. Deploy to Kubernetes
echo "☸️  Deploying to Kubernetes (Dev Overlay)..."
kubectl apply -k k8s/overlays/dev

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
