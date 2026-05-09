# 💍 Jewellery E-Commerce Platform

> A full-stack jewellery marketplace inspired by Tanishq — featuring live gold pricing, dynamic product catalogue, order management, and seamless payment integration.

![License](https://img.shields.io/badge/license-MIT-gold)
![Backend](https://img.shields.io/badge/backend-Express.js-black)
![Database](https://img.shields.io/badge/database-PostgreSQL%20%7C%20MongoDB%20%7C%20Redis-blue)
![Status](https://img.shields.io/badge/status-In%20Development-orange)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Pricing Engine](#pricing-engine)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

A production-grade jewellery e-commerce backend built with **Express.js** and a microservice-inspired modular architecture. The platform handles the unique challenges of jewellery retail — dynamic pricing tied to live gold rates, hallmarking data, BIS certification, and complex inventory (metal type, karat, weight).

Built to scale from a single-store setup to a multi-branch enterprise platform.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 20+ |
| **Framework** | Express.js |
| **Primary DB** | PostgreSQL (users, orders, transactions) |
| **Document DB** | MongoDB (product catalogue, reviews) |
| **Cache** | Redis (live gold rates, sessions, cart) |
| **Message Queue** | Kafka / RabbitMQ |
| **Search** | Elasticsearch |
| **Storage** | AWS S3 + CloudFront CDN |
| **Auth** | JWT + OTP (MSG91 / Twilio) |
| **Payments** | Razorpay (UPI, EMI, Cards, Net Banking) |
| **Frontend** | Next.js + TailwindCSS *(WIP)* |
| **Infra** | Docker, Kubernetes, AWS |
| **Monitoring** | Prometheus + Grafana + ELK Stack |

---

## 🏗 Architecture

```
Client (Web / Mobile / Admin)
          │
    [API Gateway]
    Auth · Rate Limiting · Routing
          │
    ┌─────┴──────────────────┐
    │    Core Services       │
    ├────────────────────────┤
    │  User     │  Product   │
    │  Order    │  Payment   │
    │  Pricing  │  Search    │
    │  Inventory│  Notify    │
    └────────────────────────┘
          │
  [Message Queue — Kafka]
          │
    ┌─────┴──────────────────┐
    │  Databases & Storage   │
    ├────────────────────────┤
    │ PostgreSQL │ MongoDB   │
    │ Redis      │ S3 / CDN  │
    └────────────────────────┘
```

> 📐 Full architecture diagram available in [`/docs/architecture.png`](./docs/architecture.png)

---

## ✨ Features

### Completed
- [x] Project scaffold with Express.js + modular routing
- [x] PostgreSQL + MongoDB + Redis connection setup
- [x] JWT authentication middleware
- [x] Basic product CRUD API
- [x] Docker Compose setup

### In Progress
- [ ] User auth with OTP (SMS via MSG91)
- [ ] Product catalogue with advanced filters (metal, karat, occasion, price)
- [ ] **Live gold rate pricing engine** (MCX API integration)
- [ ] Cart with real-time price recalculation
- [ ] Razorpay payment integration (UPI, EMI, Cards)
- [ ] Order tracking with status timeline
- [ ] Admin dashboard APIs

### Planned
- [ ] Virtual try-on (AR) integration
- [ ] Wishlist & personalisation
- [ ] Hallmarking & BIS certification data
- [ ] Multi-branch inventory management
- [ ] GST-compliant invoice generation
- [ ] Loyalty points / gold savings scheme

---

## 📁 Project Structure

```
jewellery-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/           # DB, Redis, Kafka configs
│   │   ├── middleware/        # Auth, error handler, logger
│   │   ├── modules/
│   │   │   ├── users/         # Auth, OTP, profiles
│   │   │   ├── products/      # Catalogue, images, filters
│   │   │   ├── orders/        # Cart, checkout, tracking
│   │   │   ├── payments/      # Razorpay integration
│   │   │   ├── pricing/       # Live gold rate engine
│   │   │   ├── inventory/     # Stock, warehouse
│   │   │   ├── search/        # Elasticsearch queries
│   │   │   └── notifications/ # Email, SMS, push
│   │   ├── utils/
│   │   └── app.js
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/                  # Next.js (WIP)
├── docs/
│   ├── architecture.png
│   ├── db-schema.png
│   └── api-reference.md
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/jewellery-ecommerce.git
cd jewellery-ecommerce
```

### 2. Start databases with Docker

```bash
docker-compose up -d
```

### 3. Install dependencies

```bash
cd backend
npm install
```

### 4. Set up environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 5. Run database migrations

```bash
npm run migrate
npm run seed      # optional: seed sample products
```

### 6. Start the server

```bash
npm run dev       # development with hot reload
npm run start     # production
```

Server runs at `http://localhost:3000`
Swagger API docs at `http://localhost:3000/api-docs`

---

## 🔐 Environment Variables

Create a `.env` file in `/backend`:

```env
# Server
PORT=3000
NODE_ENV=development

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=yourpassword
PG_DB=jewellery_db

# MongoDB
MONGO_URI=mongodb://localhost:27017/jewellery_products

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# OTP / SMS
MSG91_API_KEY=your_msg91_key
MSG91_SENDER_ID=JWLLRY

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=jewellery-assets
AWS_REGION=ap-south-1

# Gold Rate API
GOLD_RATE_API_KEY=your_key
GOLD_RATE_API_URL=https://api.goldrate.example.com
```

---

## 📖 API Documentation

Full Swagger docs available at `/api-docs` when server is running.

### Key Endpoints

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/send-otp
  POST   /api/auth/verify-otp

Products
  GET    /api/products              # list with filters
  GET    /api/products/:id
  POST   /api/products              # admin only
  PUT    /api/products/:id          # admin only

Pricing
  GET    /api/pricing/gold-rate     # live gold rate
  POST   /api/pricing/calculate     # price for a product

Orders
  POST   /api/orders                # create order
  GET    /api/orders/:id
  GET    /api/orders/my-orders      # user's orders
  PATCH  /api/orders/:id/cancel

Payments
  POST   /api/payments/initiate
  POST   /api/payments/verify
  GET    /api/payments/:orderId
```

---

## 🗄 Database Schema

### Key Tables (PostgreSQL)

```sql
products        — SKU, metal type, karat, weight, making charges
gold_rates      — live rate snapshots by karat
orders          — order with gold rate locked at purchase time
order_items     — line items with price snapshot
users           — customer profiles
addresses       — shipping addresses
payments        — payment records linked to orders
```

> 📐 Full ERD: [`/docs/db-schema.png`](./docs/db-schema.png)

---

## 💰 Pricing Engine

The core business logic — product prices are calculated dynamically:

```
Final Price = (Net Weight × Live Gold Rate per gram)
            + Making Charges
            + Stone / Diamond Value
            + GST (3% on gold jewellery)
```

Gold rates are fetched from MCX API every 15 minutes and cached in Redis. At checkout, the rate is **snapshotted** into the order so the customer's price is locked in.

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

**Commit conventions**: `feat:` `fix:` `docs:` `refactor:` `test:` `chore:`

---

## 📄 License

MIT © 2025 — Built with ❤️ for the Indian jewellery market
