"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LogOut, CreditCard } from "lucide-react";

interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    subscriptionStatus: "NONE" | "PENDING" | "ACTIVE" | "CANCELED" | "PAST_DUE";
    plan: string;
}

export default function Dashboard() {
    const { user, getToken, isLoading: authLoading, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;

            try {
                const token = await getToken();
                if (!token) return;

                const data = await fetchWithAuth("/me", token);
                setProfile(data);

                if (data.subscriptionStatus !== "ACTIVE") {
                    router.push("/paywall");
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated && user) {
            loadProfile();
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
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl">SaaS App</div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{user?.email}</span>
                    <button
                        onClick={() => logout()}
                        className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-2"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-6 mt-8">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h1 className="text-2xl font-bold mb-4">Welcome back, {profile?.firstName}!</h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                        <CreditCard size={14} />
                        Subscription Active
                    </div>

                    <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-center">
                            Your protected application content goes here.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
