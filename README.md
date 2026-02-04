# Spring Boot & Next.js SaaS Starter

A production-ready SaaS starter template ensuring a clean architecture and scalable foundation.

## 🏗️ Technology Stack

### Backend (`saasTemplet`)
- **Framework**: Spring Boot 3 (Java 17+)
- **Security**: Spring Security (OAuth2 Resource Server)
- **Database**: H2 (Dev) / PostgreSQL (Prod)
- **Billing**: Polar.sh Integration
- **Architecture**: Domain-Driven Design (DDD)

### Frontend (`next-js-saas-templet`)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Auth0 SPA SDK

---

## 🛠️ Detailed Setup Guide

### 1. Auth0 Setup (Authentication)
You will need an Auth0 account to handle user logins securely.

#### A. Create the Backend API (For Spring Boot)
1. Go to [Auth0 Dashboard](https://manage.auth0.com/).
2. Navigate to **Applications -> APIs**.
3. Click **Create API**.
   - **Name**: `SaaS Backend`
   - **Identifier**: `https://api.yoursaas.com` (Copy this!)
   - **Signing Algorithm**: RS256
4. **Copy Credential**:
   - In the API Settings, find your **Identifier**. This is your `AUTH0_AUDIENCE`.
   - In the API Settings, typically your **Domain** is visible (e.g., `dev-xyz.us.auth0.com`). This is your `AUTH0_ISSUER_URI` (must include `https://` prefix and trailing slash `/`).

#### B. Create the Frontend App (For Next.js)
1. Navigate to **Applications -> Applications**.
2. Click **Create Application**.
   - **Name**: `SaaS Frontend`
   - **Type**: Single Page Web Applications
3. **Configure Settings**:
   - **Allowed Callback URLs**: `http://localhost:3000`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
   - **Save Changes**.
4. **Copy Credentials**:
   - **Domain**: This is `NEXT_PUBLIC_AUTH0_DOMAIN`.
   - **Client ID**: This is `NEXT_PUBLIC_AUTH0_CLIENT_ID`.

---

### 2. Polar.sh Setup (Billing)
You will need a Polar.sh account to handle subscriptions and payments.

1. Go to [Polar.sh](https://polar.sh/) and sign up.
2. Create an Organization.
3. **Get Access Token**:
   - Go to **Settings -> Developers**.
   - Create a **Personal Access Token**. This is `POLAR_ACCESS_TOKEN`.
4. **Configure Webhooks**:
   - Create a webhook endpoint: `https://your-domain.com/webhooks/polar` (or use ngrok URL for local dev).
   - Copy the **Webhook Secret**. This is `POLAR_WEBHOOK_SECRET`.

---

## 🔑 Environment Variables

### Backend (`saasTemplet/src/main/resources/application.yml` or ENV)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `AUTH0_ISSUER_URI` | Auth0 URL | **Auth0 API** -> Settings -> Domain (add `https://` + `/`) |
| `AUTH0_AUDIENCE` | API Identifier | **Auth0 API** -> Settings -> Identifier |
| `POLAR_ACCESS_TOKEN` | Polar Key | **Polar** -> Settings -> Developers -> Token |
| `POLAR_WEBHOOK_SECRET` | Webhook Key | **Polar** -> Settings -> Developers -> Webhooks |

### Frontend (`next-js-saas-templet/.env.local`)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_AUTH0_DOMAIN` | Auth0 Domain | **Auth0 App** -> Settings -> Domain |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Client ID | **Auth0 App** -> Settings -> Client ID |
| `NEXT_PUBLIC_AUTH0_AUDIENCE` | API Identifier | Use the same **Identifier** from Backend setup |
| `NEXT_PUBLIC_API_BASE_URL` | API URL | URL of Spring Boot App (e.g., `http://localhost:8080`) |

---

## 🚀 Running the Project

### 1. Start the Backend
```bash
cd saasTemplet
# Set env vars
export AUTH0_ISSUER_URI=https://dev-xyz.us.auth0.com/
export AUTH0_AUDIENCE=https://api.yoursaas.com
# Run
./mvnw spring-boot:run
```

### 2. Start the Frontend
```bash
cd next-js-saas-templet
# Create .env.local with credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start!
