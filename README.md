# ⛽ FuelPass - National Fuel Quota & Station Management System

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

<p align="center">
  <strong>A modern, full-stack, QR-based fuel quota management, reservation, and station distribution platform.</strong>
</p>

</div>

---

## 💡 The Story Behind the Project

A few months ago, during the fuel crisis, I faced a common issue — when generating a QR code for fuel, I forgot which phone number or email I had used before. This made it difficult to access my fuel quota at the station.

Additionally, I couldn’t manage multiple vehicles under a single NIC, and if I didn’t use my weekly fuel quota, it would simply expire — which felt inefficient.

To solve these problems, I designed and developed the **FuelPass Management System**, introducing improvements such as:
- **NIC-based identification** for seamless account recovery and verification.
- **Multi-vehicle management** under a single national identity card.
- **Fuel reservation & carry-forward** feature that allows unused quota to be carried over to the next week (within a limited period).

What started as a simple solution to a personal problem later evolved into a complete, end-to-end system featuring dedicated modules for **Citizens**, **Fuel Station Operators**, and **District Administrators**.

---

## 🔧 Key Features

### 🛡️ District-level Admin Dashboard
- **Stock Telemetry**: Monitor real-time petrol and diesel stock across all registered fuel stations.
- **Quota Rules Engine**: Manage and configure weekly fuel limits and carry-forward allowances based on vehicle categories.
- **Station Management**: Provision new stations and handle fuel supply distribution with automated credential emails.
- **Analytics & Insights**: View daily fuel usage, consumption trends over 7 days, and low-stock station alerts.
- **Approval Desk**: Review, approve, or reject station password reset requests with automated status notifications.

### ⛽ Fuel Station Dashboard
- **Real-Time Stock Monitoring**: Live tracking of underground Petrol and Diesel storage tanks.
- **QR-Based Fuel Issuance**: Quick scanner integration to validate customer QR passes and dispense fuel in seconds.
- **Detailed Transaction Records**: Maintain comprehensive transaction audit logs with customer email removal and pagination.
- **Daily Operational Summaries**: Instant visibility of total fuel issued today and unique customer counts.
- **Stock Replenishment Logs**: Record bowser deliveries with auto-generated reference numbers (`SUP-ST001-YYYYMMDD-001`).

### 👤 User Dashboard
- **QR-Based Fuel Access**: High-resolution, dynamic QR pass for quick and secure transactions at the pump.
- **Live Quota Tracking**: Monitor remaining fuel quota, weekly allocation, and usage limits in real time.
- **Multi-Vehicle Management**: Register and switch between multiple vehicles (up to 3) under a single NIC.
- **Fuel Reservation**: Option to carry forward unused weekly quota to the next week.
- **Clean Dark Theme UI**: Sleek, responsive, and intuitive interface designed for seamless mobile and desktop experience.

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, RESTful APIs |
| **Database** | MySQL 8.0+, Connection Pooling, ACID Transactions |
| **Authentication** | JSON Web Tokens (JWT), Role-Based Access Control (RBAC) |
| **Email Services** | Nodemailer (HTML Email Templates & SMTP) |
| **QR Code Engine** | qrcode.react / html5-qrcode |

---

## 📁 Directory Structure

```text
fuelpass-management-system/
├── backend/
│   ├── config/             # MySQL database connection & pool configuration
│   ├── controllers/        # Auth, User, Station, and Admin controllers
│   ├── middleware/         # JWT verification & request input validation
│   ├── models/             # Database queries & SQL data models
│   ├── routes/             # Express API endpoints
│   ├── utils/              # Email templates & notification utilities
│   ├── migrate.js          # Automated database schema migration script
│   └── server.js           # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components & modals
│   │   ├── pages/          # Admin, Station, and User portal pages
│   │   ├── routes/         # React Router navigation configuration
│   │   └── index.css       # Tailwind CSS tokens & dark theme styling
│   ├── index.html          # Main HTML root
│   └── vite.config.js      # Vite configuration
└── README.md
```

---

<div align="center">
  <sub>Developed by <a href="https://github.com/nirsanth23">Nirsanth</a> • Built with ❤️ for National Energy Management & Fair Distribution 🇱🇰</sub>
</div>
