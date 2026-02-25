-- ============================================
-- CollectorShop - Database Initialization
-- Creates separate schemas for each microservice
-- ============================================

-- Create the Keycloak database
SELECT 'CREATE DATABASE keycloak'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

-- Create the SonarQube database
SELECT 'CREATE DATABASE sonarqube'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sonarqube')\gexec

-- Create schemas for each microservice
CREATE SCHEMA IF NOT EXISTS user_service;
CREATE SCHEMA IF NOT EXISTS catalog_service;
CREATE SCHEMA IF NOT EXISTS order_service;
CREATE SCHEMA IF NOT EXISTS payment_service;
CREATE SCHEMA IF NOT EXISTS notification_service;
CREATE SCHEMA IF NOT EXISTS chat_service;
CREATE SCHEMA IF NOT EXISTS fraud_service;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA user_service TO collector;
GRANT ALL PRIVILEGES ON SCHEMA catalog_service TO collector;
GRANT ALL PRIVILEGES ON SCHEMA order_service TO collector;
GRANT ALL PRIVILEGES ON SCHEMA payment_service TO collector;
GRANT ALL PRIVILEGES ON SCHEMA notification_service TO collector;
GRANT ALL PRIVILEGES ON SCHEMA chat_service TO collector;
GRANT ALL PRIVILEGES ON SCHEMA fraud_service TO collector;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE '✅ CollectorShop database initialized with all schemas.';
END $$;
