# Next.js SaaS Frontend

A production-ready frontend for the SaaS starter, built with Next.js 16 (App Router), TypeScript, and Auth0.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Auth0 SPA SDK
- **Icons**: Lucide React

## 🛠️ Configuration & Setup

### 1. Auth0 Configuration (SPA)
To secure your frontend, you need an Auth0 **Single Page Application**.

1. Go to [Auth0 Dashboard](https://manage.auth0.com/).
2. Navigate to **Applications -> Applications**.
3. Click **Create Application**.
   - **Name**: `SaaS Frontend`
   - **Type**: Single Page Web Applications
4. Configure **Settings**:
   - **Allowed Callback URLs**: `http://localhost:3000`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
   - **Save Changes**.

### 2. Environment Variables
Copy `.env.local` and fill in your values from the Auth0 Application you just created.

| Variable | Description | Where to find it |
|----------|-------------|------------------|
| `NEXT_PUBLIC_AUTH0_DOMAIN` | Auth0 Domain | Application Settings -> **Domain** |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Client ID | Application Settings -> **Client ID** |
| `NEXT_PUBLIC_AUTH0_AUDIENCE` | API Identifier | **Applications -> APIs** -> Identifier (Use same as Backend) |
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL | URL of your running Spring Boot app (Default: `http://localhost:8080`) |

### Example `.env.local`
```bash
NEXT_PUBLIC_AUTH0_DOMAIN=dev-xyz.us.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=AbCdEfGhIjKlMnOpQrStUvWxYz
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.yoursaas.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure
- `src/app`: App Router pages
  - `page.tsx`: Landing page (Public)
  - `home/page.tsx`: Todo Dashboard (Protected, requires active subscription)
  - `paywall/page.tsx`: Pricing/Plan Selection page (Protected)
  - `profile/page.tsx`: User Profile page (Protected)
- `src/components/providers/AuthProvider.tsx`: Auth0 Context Provider
- `src/lib/api.ts`: Authenticated fetch helper

## User Flow
1. **Login**: User clicks "Login" on landing page → Auth0 authentication
2. **Plan Selection**: After login, redirected to `/paywall` to choose a plan (Free, Basic, or Pro)
3. **Dashboard**: After selecting a plan, user lands on `/home` (Todo Dashboard)
4. **Profile**: User can view their profile at `/profile` via the "My Profile" button
