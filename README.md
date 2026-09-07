# ⛽ FuelPass - National Fuel Quota & Station Management System

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

<p align="center">
  <strong>A smart, QR-powered system for fair fuel quota distribution, real-time station stock monitoring, and eliminating fuel queues.</strong>
</p>

</div>

---

## 💡 Why This Project? (Problem & Solution)

### 🛑 The Problem
During fuel crises and supply shortages, countries face severe challenges:
- **Massive Queues**: Drivers spend hours or days waiting in line at fuel stations without knowing if fuel is available.
- **Unfair Distribution & Hoarding**: Without a quota system, some individuals purchase and hoard excessive fuel for the black market, leaving everyday citizens with nothing.
- **Zero Visibility**: Fuel station owners and government authorities lack live, unified data on how much fuel is left in tanks and where the highest demand is.

### 🎯 The Solution
The **FuelPass Management System** was built to solve this crisis by digitalizing the entire fuel distribution process:
1. **Guaranteed Weekly Quotas**: Every registered vehicle receives a fair, fixed weekly quota based on its type (Bike, Car, Three-Wheeler, Van, Bus, Lorry).
2. **Instant QR-Code Verification**: Citizens show their personal QR Pass at the station. Station pump operators scan the QR code to instantly verify remaining quota and dispense fuel in seconds.
3. **Real-Time Tank Stock Management**: Station inventories (Petrol & Diesel) update automatically with every pump transaction and bowser delivery.
4. **Complete Government Transparency**: The central administration can monitor national fuel reserves, track 7-day consumption trends, set quota rules, and audit stations in real time.

---

## ✨ Key Features

### 👤 1. Citizen & Vehicle Owner Portal
- **NIC Authentication**: Register and log in securely using National Identity Card (NIC) and OTP verification.
- **Multi-Vehicle Support**: Add and manage up to **3 vehicles** under a single user account with a quick vehicle switcher.
- **Personal QR Fuel Pass**: Generates a high-resolution QR code encoding vehicle details and remaining quota.
- **Quota Reservation & Carry-Forward**: Reserve unused fuel quota for the upcoming week.
- **Real-Time Usage History**: View exact litres pumped, transaction dates, remaining balance, and station locations.

### ⛽ 2. Fuel Station Operator Portal
- **Scan & Dispense**: Scan customer QR passes to validate eligibility and deduct fuel automatically.
- **Live Tank Inventory**: Track live storage levels for Petrol and Diesel tanks.
- **Supply Delivery Logging**: Record incoming bowser fuel shipments with auto-generated reference numbers (e.g. `SUP-ST001-20260325-001`).
- **First-Time Security Policy**: System sends temporary 6-digit passwords via email and requires a strong password setup on initial login.
- **Admin-Managed Password Recovery**: Request password resets directly through the portal with approval notifications.

### 🛡️ 3. National Admin Management Portal
- **Central Telemetry**: Live overview of total national petrol stock, diesel stock, active stations, and fuel dispensed today.
- **7-Day Consumption Trends**: Interactive charts analyzing fuel usage patterns across districts.
- **Quota Rules Engine**: Adjust weekly limits and carry-forward allowances dynamically for all vehicle classes.
- **Station Management**: Add new stations with auto-generated IDs and automatic credential email dispatch.
- **Approval Desk**: Review, approve, or reject station password reset requests with automated email updates.
- **Monthly Reporting**: Generate detailed fuel distribution summaries for government audits.

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, RESTful Architecture |
| **Database** | MySQL 8.0+, Connection Pooling, ACID Transactions |
| **Authentication** | JSON Web Tokens (JWT), Role-Based Access Control (RBAC) |
| **Email Delivery** | Nodemailer (HTML Templates & SMTP) |
| **QR Code Engine** | qrcode.react / html5-qrcode |

---

## 📁 Directory Structure

```text
fuelpass-management-system/
├── backend/
│   ├── config/             # MySQL connection & database pool
│   ├── controllers/        # Auth, User, Station, and Admin business logic
│   ├── middleware/         # JWT verification & input validation
│   ├── models/             # Database queries & data models
│   ├── routes/             # Express API endpoints
│   ├── utils/              # Email templates & notification services
│   ├── migrate.js          # Database schema migrations & initial seeds
│   └── server.js           # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components, tables, and modals
│   │   ├── pages/          # Admin, Station, and User pages
│   │   ├── routes/         # Application routing configuration
│   │   └── index.css       # Tailwind CSS & dark theme styling
│   ├── index.html          # Main HTML document
│   └── vite.config.js      # Vite build configuration
└── README.md
```

---

## 🛡️ Security Highlights

- **Stateless JWT Authentication**: Secure user session tokens across all portal operations.
- **Strong Password Rules**: Strict password complexity (letters, numbers, and special characters) enforced for station operators.
- **Atomic Database Transactions**: Prevents race conditions and guarantees stock count accuracy during simultaneous refuels and deliveries.
- **SQL Injection Protection**: Parameterized queries across all database operations.

---

<div align="center">
  <sub>Developed by <a href="https://github.com/nirsanth23">Nirsanth</a> • Built for National Energy Management & Fair Distribution 🇱🇰</sub>
</div>
