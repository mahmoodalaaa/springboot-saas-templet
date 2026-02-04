"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Check, Loader2, Zap } from "lucide-react";
import { useState } from "react";

export default function Paywall() {
    const { user, getToken, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetchWithAuth("/billing/checkout", token, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: "polar_price_123" }), // Replace with actual price ID
            });

            if (res.url) {
                window.location.href = res.url;
            }
        } catch (error) {
            console.error("Checkout failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex justify-end p-6">
                <button
                    onClick={() => logout()}
                    className="text-sm font-medium text-gray-500 hover:text-black"
                >
                    Logout
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap size={24} />
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Upgrade to Pro</h1>
                    <p className="text-gray-600 mb-8">
                        Access to this application requires an active subscription.
                    </p>

                    <ul className="text-left space-y-3 mb-8 text-gray-600">
                        <li className="flex items-center gap-2">
                            <Check size={18} className="text-green-500" /> Unlimited Projects
                        </li>
                        <li className="flex items-center gap-2">
                            <Check size={18} className="text-green-500" /> Priority Support
                        </li>
                        <li className="flex items-center gap-2">
                            <Check size={18} className="text-green-500" /> Advanced Analytics
                        </li>
                    </ul>

                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Subscribe for $29/mo"}
                    </button>
                </div>
            </div>
        </div>
    );
}
