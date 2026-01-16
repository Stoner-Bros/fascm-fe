# FASCM Frontend

Frontend Web Application for **FASCM – Fresh Agricultural Supply Chain Management System**.
This project is part of the Capstone Project at **FPT University**, providing role-based web interfaces for managing fresh agricultural supply chains with IoT integration.

---

## 🚀 Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Package Manager:** pnpm
- **UI:** React, Tailwind CSS, shadcn/ui
- **HTTP Client:** Axios
- **Authentication:** JWT-based Authentication
- **Deployment:** Vercel

---

## 👥 Supported Roles & Ports

The frontend is separated by **ports based on user roles**:

| Role | Port | Description |
|-----|------|------------|
| Supplier (Farmer) | `3001` | Supplier Web Application |
| Consignee (Retailer / Supermarket) | `3001` | Consignee Web Application |
| Admin | `3000` | System Administration Portal |
| Manager | `3000` | Management Dashboard |
| Warehouse Staff | `3000` | Warehouse Operations |
| Delivery Staff | `3000` | Delivery Management |

---

## ✨ Main Features

- Role-based authentication & authorization
- Supplier & Consignee profile management
- Purchase Order & Sale Order management
- Warehouse import / export operations
- Transportation & delivery tracking
- IoT monitoring (temperature, humidity, camera)
- Product traceability & QR code verification
- Dashboard & reporting for managers and admins

---

## 📂 Project Structure

```bash
src/
├── app/                # Next.js App Router
├── components/         # Reusable UI components
├── modules/            # Feature-based modules (orders, warehouse, users...)
├── services/           # API services
├── hooks/              # Custom React hooks
├── stores/             # State management
├── utils/              # Helper functions
├── constants/          # Constants & enums
├── styles/             # Global styles
└── middleware.ts       # Auth & role-based route protection
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_ENV=local
```

---

## 🛠 Installation & Run (pnpm)

### 1️⃣ Install dependencies

```bash
pnpm install
```

### 2️⃣ Run development servers

```bash
pnpm run dev
```

#### 🔹 Admin / Manager / Staff (Port 3000)

Access at:
👉 http://localhost:3000

#### 🔹 Supplier / Consignee (Port 3001)

Access at:
👉 http://localhost:3001

> ℹ️ Scripts `dev:admin` and `dev:client` are configured in `package.json`.

---

## 🔐 Authentication & Authorization Flow

- User logs in using email & password
- Backend returns a JWT access token
- Token is stored securely (cookie / localStorage)
- Middleware validates:
  - Authentication status
  - User role
  - Route permission
- User is redirected to the correct portal based on **role and port**

---

## 🌐 API Integration

- All APIs are consumed from the Backend service
- Base URL is defined in environment variables
- Axios interceptors handle:
  - Authorization headers
  - Global error handling
  - Token expiration (if applicable)

---

## 📈 Deployment

- Deployed using **Vercel**
- Separate environments can be configured for:
  - Admin / Manager Portal
  - Supplier / Consignee Portal
- Environment variables are managed via the Vercel Dashboard

---

## 👨‍💻 Team

- Nguyễn Thái Thanh
- Bùi Đức Hoàng
- Trần Tiến Sang
- Huỳnh Đoàn Thanh Phong
- Trương Văn Phát

---

## 📜 License
This project is developed for academic purposes as a Capstone Project at FPT University.
