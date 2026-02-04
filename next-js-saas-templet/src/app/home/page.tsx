"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export default function HomePage() {
    const { user, getToken, isLoading: authLoading, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        async function checkSubscription() {
            if (!user) return;

            try {
                const token = await getToken();
                if (!token) return;

                const data = await fetchWithAuth("/me", token);

                if (data.subscriptionStatus !== "ACTIVE") {
                    router.push("/paywall");
                }
            } catch (error) {
                console.error("Failed to check subscription", error);
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated && user) {
            checkSubscription();
        }
    }, [isAuthenticated, user, getToken, router]);

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to SaaS</h1>
            <p className="text-gray-500 mb-8">You are logged in and subscribed.</p>

            <button
                onClick={() => logout()}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
                <LogOut size={16} /> Logout
            </button>
        </div>
    );
}
