# Swag Store Platform

A full-stack e-commerce solution for purchasing company swag, built with the "SDE approach" in mind. Features a scalable architecture, AI-powered admin assistant, and robust business logic.

## 🚀 Key Features

*   **Full-Fledged Auth**: Secure User/Admin authentication with JWT.
*   **Dynamic Commerce**: Tiered pricing, real-time stock management, and coupon validation.
*   **AI Copilot**: Integrated Gemini API providing intelligent, context-aware insights to admins.
*   **Modern UX**: Smooth animations (Framer Motion), Toast notifications, and a streamlined Cart/Checkout flow.
*   **Admin Dashboard**: Real-time sales stats, order monitoring, and AI chat.
*   **Data Integrity**: MongoDB schema validation for products, orders, and coupons.

## 🧠 Design Decisions

### 1. Architecture: Monolith with Separation of Concerns
*   **Why?** Given the "Intern" scope and 48hr timeline, a monolithic server (Express) paired with a separate client (Next.js) offers the best balance of speed and structure.
*   **Backend**: Controller-Service pattern (simplified) keeps logic out of routes.
*   **Frontend**: Next.js 14 App Router for server-side optimization where possible, with Client Components for interactive UI (Cart, Chat).

### 2. State Management: Context API
*   **Why?** For a project of this size, Redux is overkill. React Context (`CartContext`, `AuthContext`) provides sufficient global state handling without boilerplate.

### 3. AI Integration Strategy
*   **Context Injection**: The AI isn't just a chatbot; it's fed a live "Summary" of the database (Revenue, Low Stock, Active Coupons) before every prompt.
*   **Guardrails**: Prompt engineering ensures the AI acts as a professional assistant and declines unrelated queries.

### 4. Database Schema
*   **Orders**: Linked to `User` (if logged in) but allows Guest interactions (demo friendly).
*   **Coupons**: Logic handles strict constraints (expiry, usage limits).

## ⚠️ Edge Cases Handled

*   **Stock Concurrency**: Stock is checked *immediately* before order creation. In a real production env, I would verify this again with a database transaction.
*   **Coupon Abuse**: Validation checks expiry, active status, and usage filters server-side, not just client-side.
*   **$0 Orders**: Allowed if coupon covers full cost, but handled gracefully.
*   **Invalid States**: "Loading" and "Error" states user-friendly feedback via Toasts.

## 🛠 Tech Stack

*   **Frontend**: Next.js, React, Tailwind CSS, Framer Motion, Axios.
*   **Backend**: Node.js, Express, Mongoose (MongoDB).
*   **AI**: Google Gemini Pro.
*   **Auth**: JWT, Bcrypt.

## 🏃‍♂️ How to Run

1.  **Clone Repo** and cd into it.
2.  **Environment Setup**:
    *   `cd server && cp .env.example .env` (Set `MONGO_URI` and `GEMINI_API_KEY`, `JWT_SECRET`).
    *   `cd client` (No env needed for basic demo, connects to localhost:5000).
3.  **Install & Seed**:
    *   `cd server && npm install && npm run seed` (Deletes old data, adds products/coupons + Admin User).
    *   `cd client && npm install`.
4.  **Start**:
    *   Server: `cd server && npm start`
    *   Client: `cd client && npm run dev`
    *   Visit `http://localhost:3000`.

**Admin Credentials (from Seed):**
*   Email: `admin@swag.com`
*   Password: `adminpassword`
