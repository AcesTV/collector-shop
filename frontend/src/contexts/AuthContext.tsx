import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import keycloak from '../config/keycloak';

interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AuthUser | null;
    token: string | undefined;
    login: () => void;
    logout: () => void;
    register: () => void;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        keycloak
            .init({
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                pkceMethod: 'S256',
            })
            .then((authenticated) => {
                setIsAuthenticated(authenticated);
                if (authenticated && keycloak.tokenParsed) {
                    setUser({
                        id: keycloak.tokenParsed.sub || '',
                        email: keycloak.tokenParsed.email || '',
                        firstName: keycloak.tokenParsed.given_name || '',
                        lastName: keycloak.tokenParsed.family_name || '',
                        roles: keycloak.tokenParsed.realm_access?.roles || [],
                    });
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Keycloak init failed:', err);
                setIsLoading(false);
            });

        // Auto-refresh token
        const interval = setInterval(() => {
            if (keycloak.authenticated) {
                keycloak.updateToken(60).catch(() => {
                    console.warn('Token refresh failed');
                });
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const login = () => keycloak.login();
    const logout = () => keycloak.logout({ redirectUri: window.location.origin });
    const register = () => keycloak.register();
    const hasRole = (role: string) => user?.roles.includes(role) || false;

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                token: keycloak.token,
                login,
                logout,
                register,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
