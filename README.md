# Todo SaaS — MERN + Redis + K8s

A **production-grade** Todo SaaS application built with the MERN stack, JWT + Google OAuth authentication, Razorpay premium payments, Redis full-text search, Docker, and self-hosted Kubernetes.

---

## Architecture

```text
to-do-advance-app/
├── frontend/                   React (Vite) SPA → Nginx in Docker
├── services/
│   ├── auth-service/           Express  :4001  JWT · Google OAuth · Razorpay
│   └── todo-service/           Express  :4002  MongoDB · Redis cache · FT.SEARCH
├── k8s/                        Kubernetes manifests (5 separate pods)
├── docker-compose.yml          Local dev — all 5 services
└── .env.example                Environment variable template
```
