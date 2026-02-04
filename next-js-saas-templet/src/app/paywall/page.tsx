"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Paywall() {
    const { getToken, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpgrade = async (priceId: string) => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetchWithAuth("/billing/checkout", token, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId }),
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
                <h1 className="text-3xl font-bold mb-4">Choose your plan</h1>
                <p className="text-gray-600 mb-12">Select the plan that fits your needs.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                    {/* FREE PLAN */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="mb-4">
                            <span className="text-sm font-bold bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Free</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">$0<span className="text-lg text-gray-400 font-normal">/mo</span></h2>
                        <ul className="text-left space-y-3 mb-8 text-gray-600 flex-1">
                            <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> 5 Todos</li>
                            <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> Basic features</li>
                        </ul>
                        <button
                            onClick={() => router.push("/home")}
                            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* BASIC PLAN */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 flex flex-col relative overflow-hidden">
                        <div className="mb-4">
                            <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Basic</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">$9<span className="text-lg text-gray-400 font-normal">/mo</span></h2>
                        <ul className="text-left space-y-3 mb-8 text-gray-600 flex-1">
                            <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> 50 Todos</li>
                            <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> Priority Support</li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade("price_basic_123")}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Subscribe"}
                        </button>
                    </div>

                    {/* PREMIUM PLAN */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-purple-100 flex flex-col">
                        <div className="mb-4">
                            <span className="text-sm font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Pro</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">$29<span className="text-lg text-gray-400 font-normal">/mo</span></h2>
                        <ul className="text-left space-y-3 mb-8 text-gray-600 flex-1">
                            <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> Unlimited Todos</li>
                            <li className="flex items-center gap-2"><Check size={18} className="text-green-500" /> Analytics</li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade("price_pro_123")}
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Subscribe"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
