FROM quay.io/keycloak/keycloak:24.0

# Copy realm configuration for auto-import
COPY realm-export.json /opt/keycloak/data/import/realm-export.json

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--import-realm", "--health-enabled=true"]
