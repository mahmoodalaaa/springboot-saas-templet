"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Plus, Trash2, CheckCircle, Circle, Check } from "lucide-react";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

export default function HomePage() {
    const { user, getToken, isLoading: authLoading, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");
    const [subscriptionStatus, setSubscriptionStatus] = useState("NONE");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [authLoading, isAuthenticated, router]);

    // Initial Data Fetch
    useEffect(() => {
        async function loadData() {
            if (!user) return;

            try {
                const token = await getToken();
                if (!token) return;

                // 1. Check Sub Details
                const meData = await fetchWithAuth("/me", token);
                setSubscriptionStatus(meData.subscriptionStatus);

                // Allow access even if not active for this demo flow, but ideally:
                if (meData.subscriptionStatus !== "ACTIVE") router.push("/paywall");

                // 2. Load Todos
                const todosData = await fetchWithAuth("/api/todos", token);
                setTodos(todosData);

            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated && user) {
            loadData();
        }
    }, [isAuthenticated, user, getToken, router]);

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        try {
            const token = await getToken();
            const res = await fetchWithAuth("/api/todos", token, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTodo }),
            });
            setTodos([...todos, res]);
            setNewTodo("");
        } catch (error) {
            console.error("Failed to add todo", error);
        }
    };

    const toggleTodo = async (id: number) => {
        try {
            const token = await getToken();
            const res = await fetchWithAuth(`/api/todos/${id}/toggle`, token, { method: "PUT" });
            setTodos(todos.map(t => t.id === id ? res : t));
        } catch (error) {
            console.error("Failed to toggle todo", error);
        }
    };

    const deleteTodo = async (id: number) => {
        try {
            const token = await getToken();
            await fetchWithAuth(`/api/todos/${id}`, token, { method: "DELETE" });
            setTodos(todos.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete todo", error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const isSuccess = searchParams.get("success") === "true";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Todo App</h1>
                    {subscriptionStatus === "ACTIVE" && (
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            PRO
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/profile")}
                        className="text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors hidden md:block"
                    >
                        My Profile
                    </button>
                    <span className="text-sm text-gray-500 hidden md:block">{user?.email}</span>
                    <button
                        onClick={() => logout()}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-3xl w-full mx-auto p-6">
                {isSuccess && (
                    <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex items-center gap-2">
                        <CheckCircle size={20} />
                        Subscription successful! Welcome to Pro.
                    </div>
                )}

                {/* Add Todo Input */}
                <form onSubmit={addTodo} className="mb-8 relative">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full pl-6 pr-14 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                    />
                    <button
                        type="submit"
                        disabled={!newTodo.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                    >
                        <Plus size={24} />
                    </button>
                </form>

                {/* Todo List */}
                <div className="space-y-3">
                    {todos.length === 0 && (
                        <div className="text-center text-gray-400 py-12">
                            No tasks yet. Add one above!
                        </div>
                    )}

                    {todos.map((todo) => (
                        <div
                            key={todo.id}
                            className={`group bg-white p-4 rounded-xl shadow-sm border border-transparent transition-all hover:shadow-md flex items-center gap-4 ${todo.completed ? "opacity-60 bg-gray-50" : ""
                                }`}
                        >
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-300 text-transparent hover:border-green-500"
                                    }`}
                            >
                                <Check size={14} strokeWidth={3} />
                            </button>

                            <span
                                className={`flex-1 text-lg truncate ${todo.completed ? "line-through text-gray-400" : "text-gray-800"
                                    }`}
                            >
                                {todo.title}
                            </span>

                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
