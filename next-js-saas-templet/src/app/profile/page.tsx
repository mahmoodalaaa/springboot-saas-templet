"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, User as UserIcon, CreditCard, Calendar } from "lucide-react";

interface UserData {
    id: string;
    email: string;
    subscriptionStatus: string;
    plan?: string;
    createdAt: string;
    polarCustomerId: string;
}

export default function ProfilePage() {
    const { user, getToken, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
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
                setUserData(data);

                // Enforce plan selection logic if desired, or just show empty state
                // if (data.subscriptionStatus !== "ACTIVE") router.push("/paywall");
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

    if (!userData) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
            <div className="max-w-2xl w-full">

                {/* Back Link */}
                <button
                    onClick={() => router.push("/home")}
                    className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-900 text-white p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl font-bold">
                                {userData.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">My Profile</h1>
                                <p className="text-gray-400">{userData.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-8 space-y-8">

                        {/* Subscription Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 border-b pb-2">
                                <CreditCard size={20} className="text-gray-400" />
                                Subscription Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userData.subscriptionStatus === "ACTIVE"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {userData.subscriptionStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Customer ID</p>
                                    <p className="font-mono text-sm text-gray-700 truncate" title={userData.polarCustomerId}>
                                        {userData.polarCustomerId || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Account Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 border-b pb-2">
                                <UserIcon size={20} className="text-gray-400" />
                                Account Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Auth ID</p>
                                    <p className="font-mono text-sm text-gray-700 truncate">{user?.sub}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Calendar size={12} /> Joined On
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(userData.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
