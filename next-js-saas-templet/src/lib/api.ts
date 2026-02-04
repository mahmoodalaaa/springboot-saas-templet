export async function fetchWithAuth(url: string, token: string | undefined, options: RequestInit = {}) {
    const headers = new Headers(options.headers);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json();
}
