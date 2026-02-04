"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/paywall");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="font-bold text-xl">SaaS Starter</div>
        <button
          onClick={() => login()}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Login
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Build your SaaS <span className="text-blue-600">faster</span>.
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          A production-ready starter template with Next.js, Spring Boot, Auth0, and Polar.sh using a paywall-first architecture.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => login()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Get Started <ArrowRight size={20} />
          </button>

          <Link
            href="https://github.com/your-username/saas-starter"
            className="flex items-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            GitHub
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-left">
          <div className="p-6 border rounded-2xl bg-gray-50/50">
            <Lock className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Auth0 Secured</h3>
            <p className="text-gray-600 text-sm">
              Enterprise-grade authentication out the box with OAuth2 and social login support.
            </p>
          </div>
          <div className="p-6 border rounded-2xl bg-gray-50/50">
            <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center font-bold mb-4">$</div>
            <h3 className="font-bold text-lg mb-2">Polar Billing</h3>
            <p className="text-gray-600 text-sm">
              Monetize instantly with Polar.sh subscriptions and paywall-first routing.
            </p>
          </div>
          <div className="p-6 border rounded-2xl bg-gray-50/50">
            <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-4">API</div>
            <h3 className="font-bold text-lg mb-2">Spring Boot API</h3>
            <p className="text-gray-600 text-sm">
              Robust Java backend with JPA, PostgreSQL support, and secure endpoints.
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-sm">
        © 2024 SaaS Starter. All rights reserved.
      </footer>
    </div>
  );
}
