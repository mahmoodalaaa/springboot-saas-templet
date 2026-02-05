"use client";

import { Auth0Client, createAuth0Client, User } from "@auth0/auth0-spa-js";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | undefined;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    getToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    user: undefined,
    login: async () => { },
    logout: async () => { },
    getToken: async () => undefined,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [auth0Client, setAuth0Client] = useState<Auth0Client | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth0 = async () => {
            try {
                const client = await createAuth0Client({
                    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
                    clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
                    authorizationParams: {
                        redirect_uri: typeof window !== "undefined" ? window.location.origin : undefined,
                        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
                        scope: "openid profile email",
                    },
                    cacheLocation: "localstorage",
                });

                setAuth0Client(client);

                if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
                    await client.handleRedirectCallback();
                    window.history.replaceState({}, document.title, "/home");
                }

                const authenticated = await client.isAuthenticated();
                setIsAuthenticated(authenticated);

                if (authenticated) {
                    const user = await client.getUser();
                    setUser(user);
                }
            } catch (error) {
                console.error("Error initializing Auth0:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth0();
    }, []);

    const login = async () => {
        await auth0Client?.loginWithRedirect();
    };

    const logout = async () => {
        await auth0Client?.logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    };

    const getToken = async () => {
        return await auth0Client?.getTokenSilently();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
}
