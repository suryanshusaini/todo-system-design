# Todo SaaS — MERN + Redis + K8s

A **production-grade** Todo SaaS application built with the MERN stack, JWT + Google OAuth authentication, Razorpay premium payments, Redis full-text search, Docker, and self-hosted Kubernetes.

---

## Architecture

```
to-do-advance-app/
├── frontend/                   React (Vite) SPA → Nginx in Docker
├── services/
│   ├── auth-service/           Express  :4001  JWT · Google OAuth · Razorpay
│   └── todo-service/           Express  :4002  MongoDB · Redis cache · FT.SEARCH
├── k8s/                        Kubernetes manifests (5 separate pods)
├── docker-compose.yml          Local dev — all 5 services
└── .env.example                Environment variable template
```

### Pod topology (Kubernetes)

| Pod | Image | Port |
|---|---|---|
| `mongo` | `mongo:7` (StatefulSet) | 27017 |
| `redis` | `redis/redis-stack` | 6379 / 8001 |
| `auth-service` | `todo-saas/auth-service` | 4001 |
| `todo-service` | `todo-saas/todo-service` | 4002 |
| `frontend` | `todo-saas/frontend` (Nginx) | 80 / NodePort 30080 |

---

## Features

| Feature | Detail |
|---|---|
| **JWT Auth** | httpOnly cookie, 7-day expiry, `jsonwebtoken` |
| **Google OAuth** | `passport-google-oauth20`, redirects back to `/app` |
| **Razorpay** | Test-mode order creation + HMAC webhook verification → `premium: true` |
| **MongoDB** | Mongoose models with compound index on `{ userId, createdAt }` |
| **Redis Cache** | 30-second TTL list cache per user |
| **RediSearch** | `FT.CREATE idx:todos` — full-text search on todo titles (premium only) |
| **Docker** | Multi-stage Dockerfile for frontend, single-stage for services |
| **Kubernetes** | 5 separate pods, secrets from K8s Secret, NodePort frontend |

---

## Quick Start (Docker Compose)

```bash
# 1. Clone and enter
git clone <repo-url>
cd to-do-advance-app

# 2. Configure environment
cp .env.example .env
# Edit .env — set AUTH_JWT_SECRET, TODO_JWT_SECRET, Google OAuth, Razorpay keys

# 3. Build and run all 5 services
docker compose up --build

# 4. Open
open http://localhost
```

Health checks:
```bash
curl http://localhost:4001/health   # {"ok":true,"service":"auth"}
curl http://localhost:4002/health   # {"ok":true,"service":"todo"}
```

---

## Local Development (without Docker)

Prerequisites: **Node 20+**, **MongoDB**, **Redis Stack**

```bash
# Start MongoDB locally (or use MongoDB Atlas)
# Start Redis Stack: docker run -p 6379:6379 redis/redis-stack-server

# Auth service
cd services/auth-service
npm install
cp ../../.env.example .env    # edit as needed
npm run dev

# Todo service (new terminal)
cd services/todo-service
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Kubernetes (Self-Hosted)

### 1. Build and push images

```bash
# Build
docker build -t todo-saas/auth-service:latest   ./services/auth-service
docker build -t todo-saas/todo-service:latest   ./services/todo-service
docker build -t todo-saas/frontend:latest       ./frontend

# If using a private registry (e.g. local registry on :5000):
docker tag  todo-saas/auth-service:latest   localhost:5000/todo-saas/auth-service:latest
docker push localhost:5000/todo-saas/auth-service:latest
# (repeat for other images, update image: fields in k8s/*.yaml accordingly)
```

### 2. Create the Secret

```bash
cp k8s/secret.example.yaml k8s/secret.yaml

# Base64-encode each value, e.g.:
echo -n 'my_super_secret' | base64

# Edit k8s/secret.yaml and replace every REPLACE_WITH_BASE64_... placeholder
```

### 3. Apply manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/todo-service.yaml
kubectl apply -f k8s/frontend.yaml

# Verify all pods are Running
kubectl get pods -n todo-saas
```

### 4. Access the app

```bash
# Get the node IP
kubectl get nodes -o wide

# Open in browser
open http://<NODE_IP>:30080
```

---

## API Reference

### Auth Service — port 4001

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register with username + password |
| `POST` | `/auth/login` | — | Login → sets httpOnly cookie |
| `POST` | `/auth/logout` | — | Clear auth cookie |
| `GET` | `/auth/google` | — | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | — | OAuth callback → set cookie → redirect `/app` |
| `GET` | `/me` | Cookie | Get current user |
| `GET` | `/token` | Cookie | Exchange cookie → Bearer token (for todo-service) |
| `POST` | `/premium/order` | Cookie | Create Razorpay order |
| `POST` | `/premium/webhook` | Razorpay HMAC | Mark user premium |

### Todo Service — port 4002

All routes require `Authorization: Bearer <token>` header.

| Method | Path | Premium | Description |
|---|---|---|---|
| `GET` | `/todos` | No | List all todos (Redis cache → MongoDB) |
| `POST` | `/todos` | No | Create todo + index in Redis HASH |
| `PATCH` | `/todos/:id` | No | Update todo + invalidate cache |
| `DELETE` | `/todos/:id` | No | Delete todo + invalidate cache |
| `GET` | `/todos/search?q=` | **Yes** | Redis FT.SEARCH full-text search |

---

## Environment Variables

See [`.env.example`](.env.example) for the full list.

| Variable | Service | Description |
|---|---|---|
| `AUTH_JWT_SECRET` | auth | Secret used to sign/verify JWTs |
| `TODO_JWT_SECRET` | todo | Same secret — verify Bearer tokens |
| `GOOGLE_CLIENT_ID` | auth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | auth | Google OAuth client secret |
| `RAZORPAY_KEY_ID` | auth | Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | auth | Razorpay test key secret |
| `RAZORPAY_WEBHOOK_SECRET` | auth | Razorpay webhook signing secret |
| `MONGO_URI` | both | MongoDB connection string |
| `REDIS_URL` | todo | Redis connection URL |

---

## Testing Payments

1. Use [Razorpay test credentials](https://razorpay.com/docs/payments/payments/test-card-details/)
2. Test card: `4111 1111 1111 1111`, any future expiry, any CVV
3. After payment, Razorpay fires the webhook → `premium: true` set on user
4. Refresh the page — **⭐ Pro** badge appears and Redis search unlocks

---

## Tech Stack

- **Frontend**: React 18 · Vite · React Router v6 · Vanilla CSS
- **Auth API**: Express · Mongoose · passport-google-oauth20 · jsonwebtoken · Razorpay
- **Todo API**: Express · Mongoose · redis (node client) · RediSearch
- **Database**: MongoDB 7
- **Cache / Search**: Redis Stack (includes RediSearch)
- **Containerisation**: Docker · docker-compose
- **Orchestration**: Kubernetes (self-hosted) — 5 separate pods
