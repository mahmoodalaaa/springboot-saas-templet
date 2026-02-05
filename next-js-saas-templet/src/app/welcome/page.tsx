"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Crown } from "lucide-react";

export default function WelcomePage() {
    const { user, getToken, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);

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
                const meData = await fetchWithAuth("/me", token);

                if (meData.subscriptionStatus === "ACTIVE") {
                    setIsPremium(true);
                } else {
                    router.push("/paywall");
                }
            } catch (error) {
                console.error("Failed to verify subscription", error);
                router.push("/home");
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6">
            <button
                onClick={() => router.push("/home")}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Dashboard
            </button>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-12 text-center border border-white">
                <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-200">
                    <Crown size={40} className="text-white" />
                </div>

                <h1 className="text-4xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Welcome!
                </h1>

                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                    You have successfully unlocked the premium experience. We are thrilled to have you as a basic plan member.
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-blue-700 font-semibold">Premium Features Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
