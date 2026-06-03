# 💍 Kanakam Fine Jewellery E-Commerce

> A full-stack jewellery marketplace inspired by premium brands — featuring live gold pricing, a dynamic product catalogue, order management, Razorpay payment integration, and a dedicated admin dashboard.

![Status](https://img.shields.io/badge/status-Active-success)
![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Vite%20%7C%20Zustand-blue)
![Backend](https://img.shields.io/badge/backend-Express.js%20%7C%20Node.js-green)
![Database](https://img.shields.io/badge/database-MongoDB%20%7C%20Redis-red)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pricing Engine](#pricing-engine)
- [License](#license)

---

## Overview

Kanakam Fine Jewellery is a production-grade MERN-stack e-commerce platform. It handles the unique challenges of jewellery retail, specifically **dynamic pricing tied to live gold rates**. The application is fully responsive with a premium aesthetic, featuring smooth animations, toast notifications, and an intuitive user experience.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **State Management:** Zustand (Auth, Cart, Products, Gold Rate polling)
- **Routing:** React Router v6
- **Styling:** Vanilla CSS (BEM naming convention)
- **Icons & UI:** Lucide React, React Hot Toast
- **Payment Gateway:** Razorpay Checkout Integration

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Cache & Rate Limiting:** Redis
- **Authentication:** JWT, bcryptjs
- **Email Service:** Nodemailer (Forgot Password OTPs)
- **Payments:** Razorpay Server SDK

---

## ✨ Features

### Customer Features
- **Live Gold Pricing:** Prices recalculate dynamically based on live 18K, 22K, and 24K gold rates.
- **Product Catalogue:** Advanced filtering (Category, Metal, Price, Sort) and search functionality.
- **Shopping Cart:** Persistent cart using local storage with live total calculations (GST + Shipping).
- **Secure Checkout:** Integrated with Razorpay for UPI, Cards, and Netbanking.
- **Authentication:** Register, Login, Forgot Password (OTP via Email), Reset Password.
- **Order Management:** View order history and real-time status.
- **Wishlist & Profile:** Personal dashboard to manage account details.

### Admin Features
- **Admin Dashboard:** Overview of total revenue, orders, users, and low stock alerts.
- **Product Management:** Full CRUD operations for jewellery items (supports multiple metal types, karats, weights, and making charges).
- **Order Processing:** Update order statuses (Pending, Processing, Shipped, Delivered) securely.
- **Protected Routes:** Role-based access control ensuring only authorized admins can access management tools.

---

## 📁 Project Structure

```text
jewellery-ecommerce/
├── Backend/
│   ├── src/
│   │   ├── config/           # MongoDB, Redis, Razorpay configs
│   │   ├── middleware/       # Auth, Admin check, Error handling
│   │   ├── modules/
│   │   │   ├── admin/        # Admin dashboard stats
│   │   │   ├── auth/         # Login, Register, Forgot/Reset Password (OTP)
│   │   │   ├── notifications/# Nodemailer email service
│   │   │   ├── orders/       # Order creation & history
│   │   │   ├── payments/     # Razorpay initiate/verify
│   │   │   ├── pricing/      # Gold rate mock/polling
│   │   │   └── products/     # Product catalogue CRUD
│   │   └── server.js         # Entry point
│   ├── .env                  # Backend Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/           # Images and static files
│   │   ├── components/       # Reusable UI components (Navbar, CartDrawer, Auth)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components (Home, Products, Checkout, Admin)
│   │   ├── services/         # Axios API interceptors & endpoints
│   │   ├── store/            # Zustand stores
│   │   ├── utils/            # Helper functions (price calculation)
│   │   ├── App.jsx           # App Routing
│   │   └── main.jsx          # React Root
│   ├── .env                  # Frontend Environment variables
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18+ or v20+
- **MongoDB:** Local instance or MongoDB Atlas cluster
- **Redis:** Local instance or Redis Labs

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/jewellery-ecommerce.git
cd jewellery-ecommerce
```

### 2. Setup the Backend
```bash
cd Backend
npm install
```
Configure your `.env` file (see [Environment Variables](#environment-variables)). Then start the server:
```bash
npm run dev
```
*Backend runs on `http://localhost:5001` by default.*

### 3. Setup the Frontend
Open a new terminal tab:
```bash
cd frontend
npm install
```
Configure your `.env` file for the frontend. Then start the React app:
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173` by default.*

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/jewellery-ecommerce

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Nodemailer / Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="Kanakam Fine Jewellery <your_email@gmail.com>"

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

---

## 💰 Pricing Engine

The core business logic recalculates prices dynamically on the frontend and validates them strictly on the backend during checkout.

```text
Gold Value = (Net Weight in grams) × (Live Gold Rate per gram)
Stone Value = Sum of all gemstone/diamond prices
Subtotal = Gold Value + Stone Value + Making Charges
GST = Subtotal × 3%
Final Price = Subtotal + GST + Shipping (if applicable)
```

Gold rates are polled in real-time. When a customer places an order, the current rate is **snapshotted** in the database to lock in the price for that specific transaction.

---

## 📄 License

MIT © 2026 Kanakam Fine Jewellery.
