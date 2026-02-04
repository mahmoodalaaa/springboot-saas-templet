# Spring Boot SaaS Starter

A production-ready Spring Boot starter for SaaS applications with Auth0 authentication and Polar.sh billing.
Features a clean architecture with separate `model`, `repository`, `service`, and `controller` packages.

## Tech Stack
- Java 17+
- Spring Boot 3.x
- Spring Security (OAuth2 Resource Server)
- Spring Data JPA
- H2 (Development) / PostgreSQL (Production)
- Auth0 (Identity)
- Polar.sh (Billing)

## 🛠️ Configuration & Setup

### 1. Auth0 Setup
To secure your API, you need an Auth0 account.
1. Go to [Auth0 Dashboard](https://manage.auth0.com/).
2. Navigate to **Applications -> APIs**.
3. Click **Create API**.
   - **Name**: `SaaS Backend`
   - **Identifier**: `https://api.yoursaas.com` (This is your `AUTH0_AUDIENCE`)
   - **Signing Algorithm**: RS256
4. Get your **Issuer URI**:
   - Go to the API settings or your Tenant Settings.
   - It usually looks like `https://dev-xxxx.us.auth0.com/` (This is your `AUTH0_ISSUER_URI`).

### 2. Polar.sh Setup
To handle billing, set up Polar.sh.
1. Go to [Polar.sh](https://polar.sh/) and sign up.
2. Create an Organization.
3. Go to **Settings -> Developers**.
4. Create a **Personal Access Token** (This is your `POLAR_ACCESS_TOKEN`).
5. Configure Webhooks:
   - Endpoint: `https://your-domain.com/webhooks/polar` (or use ngrok for local dev).
   - Get the **Webhook Secret** (This is your `POLAR_WEBHOOK_SECRET`).

### 3. Environment Variables
Set these variables before running the app (or in your IDE Run Configuration):

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH0_ISSUER_URI` | Auth0 Issuer | `https://dev-xyz.us.auth0.com/` |
| `AUTH0_AUDIENCE` | API Identifier | `https://api.yoursaas.com` |
| `POLAR_ACCESS_TOKEN` | Polar Token | `polar_pat_...` |
| `POLAR_WEBHOOK_SECRET` | Webhook Secret | `whsec_...` |

### 4. Database & H2 Console
The app uses H2 in-memory database by default.
- **H2 Console URL**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **JDBC URL**: `jdbc:h2:mem:saasdb`
- **User**: `saas`
- **Password**: `password`

## 🚀 Running the Application

### Using Maven Wrapper
```bash
./mvnw spring-boot:run
```

### Running Tests
```bash
./mvnw test
```

## API Endpoints

- `GET /me` - Get current user profile (Requires JWT)
- `POST /billing/checkout` - Create checkout session (Requires JWT)
- `POST /webhooks/polar` - Handle Polar webhooks (Public)

## Project Structure
- `model`: JPA Entities (`User`)
- `repository`: Data Access (`UserRepository`)
- `service`: Business Logic (`UserService`, `PolarService`)
- `controller`: REST Endpoints
- `config`: Security & App Config

