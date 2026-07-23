# AssetFlow
### Enterprise Asset & Resource Management System

A comprehensive ERP platform to digitize and simplify asset tracking, resource booking, and maintenance workflows across organizations.

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features-mapped-to-requirements)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start-one-command-setup)
- [User Roles & Workflows](#user-roles--workflows)
- [Screenshots](#screenshots)
- [API Documentation](#api-documentation)
- [Development](#development)

---

## Problem Statement

Organizations struggle with manual asset tracking using spreadsheets and paper logs, resulting in:
- Lost or misplaced assets
- Double-allocation conflicts
- Limited visibility into asset lifecycle and maintenance history
- Inefficient shared resource booking with scheduling conflicts
- Lack of audit trails and compliance reporting

**Requirements:** Build a role-based ERP platform that provides:
- Role-based access control (Admin, Asset Manager, Department Head, Employee)
- Full asset lifecycle tracking (Available, Allocated, Under Maintenance, Retired, etc.)
- Conflict-free allocation and resource booking
- Structured maintenance approval workflows
- Audit cycles with discrepancy detection
- Real-time notifications and KPI dashboards

---

## Solution Overview

AssetFlow is a full-stack enterprise asset management system that eliminates manual tracking inefficiencies by providing:

1. **Centralized Asset Registry** — Track assets from acquisition to disposal
2. **Smart Allocation Engine** — Prevents double-allocation conflicts with transfer workflows
3. **Time-Slot Resource Booking** — Calendar-based booking with overlap validation
4. **Structured Maintenance Workflow** — Approval-based repair routing with status tracking
5. **Audit Cycle Management** — Auditor assignment, verification, and discrepancy reporting
6. **Role-Based Dashboards** — Real-time KPIs, overdue alerts, and actionable insights
7. **Complete Activity Logging** — Full audit trail for compliance

---

## Key Features (Mapped to Requirements)

### 1. Authentication & Authorization
- Secure signup creates Employee accounts only
- JWT-based session management
- Admin-only role promotion via Employee Directory (no self-elevation)

### 2. Dashboard / Home Screen
- KPI Cards: Assets Available, Allocated, Under Maintenance, Active Bookings, Pending Transfers
- Overdue Alerts: Highlights past-due returns and maintenance tasks
- Quick Actions: Register Asset, Book Resource, Raise Maintenance Request

### 3. Organization Setup (Admin Only)
**Department Management**
- Create/edit/deactivate departments with hierarchical structure
- Assign Department Heads

**Asset Category Management**
- Define categories (Electronics, Furniture, Vehicles)
- Configure custom fields per category

**Employee Directory**
- Manage employees: Name, Email, Department, Role, Status
- Role promotion: Admin elevates Employee to Department Head or Asset Manager

### 4. Asset Registration & Directory
- Register Assets: Auto-generated tag (AF-0001), serial number, acquisition cost, condition, location, photos/documents
- Lifecycle States: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
- Search/Filter: By tag, serial, QR code, category, status, department, location
- Asset History: Complete allocation and maintenance timeline

### 5. Asset Allocation & Transfer
- Conflict Prevention: System blocks double-allocation
  - Example: If Priya holds Laptop AF-0114, Raj's allocation attempt is rejected with a "Transfer Request" option
- Transfer Workflow: Request → Approval (Asset Manager/Dept Head) → Re-allocation
- Return Flow: Mark returned, capture condition notes, status reverts to Available
- Overdue Tracking: Auto-flags allocations past Expected Return Date

### 6. Resource Booking
- Calendar View: Existing bookings for shared resources (rooms, vehicles, equipment)
- Overlap Validation: Rejects conflicting time slots
  - Example: Room B2 booked 9:00–10:00 → request for 9:30–10:30 rejected; 10:00–11:00 allowed
- Booking Status: Upcoming, Ongoing, Completed, Cancelled
- Reminders: Notification before booking starts

### 7. Maintenance Management
- Raise Request: Select asset, describe issue, set priority, attach photo
- Approval Workflow: Pending → Approved/Rejected → Technician Assigned → In Progress → Resolved
- Auto Status Update: Asset moves to "Under Maintenance" on approval, back to "Available" on resolution
- Maintenance History: Retained per asset for analytics

### 8. Asset Audit Cycles
- Create Audit Cycle: Define scope (department/location) and date range
- Assign Auditors: Multiple auditors per cycle
- Verification: Mark each asset as Verified, Missing, or Damaged
- Discrepancy Reports: Auto-generated for flagged items
- Close Cycle: Locks audit and updates asset statuses

### 9. Reports & Analytics
- Asset utilization trends (most-used vs. idle assets)
- Maintenance frequency by asset/category
- Department-wise allocation summary
- Resource booking heatmap (peak usage analysis)
- Exportable reports

### 10. Notifications & Activity Logs
- Notifications: Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled, Transfer Approved, Overdue Return Alert, Audit Discrepancy Flagged
- Audit Log: Full trail of admin/manager/employee actions (who, what, when)

---

## Tech Stack

### Frontend
- **React 19.2** — Component-based UI
- **Vite** — Build tool
- **Tailwind CSS 4.0** — Custom design system with dark theme
- **React Router** — Client-side routing
- **Lucide Icons** — Iconography
- **Recharts** — Data visualizations

### Backend
- **Node.js 20** — Runtime environment
- **Express.js** — RESTful API framework
- **Prisma ORM** — Type-safe database access
- **PostgreSQL 16** — Relational database
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **Zod** — Request validation

### DevOps
- **Docker & Docker Compose** — Containerized deployment
- **Multi-stage builds** — Optimized production images
- **nginx** — Frontend static file serving

---

## Architecture

### System Design

```
┌─────────────────┐
│   React SPA     │  Frontend (Port 3000)
│   (nginx)       │  - Dark-themed UI
└────────┬────────┘  - Role-based views
         │           - Real-time dashboard
         ↓
┌─────────────────┐
│  Express API    │  Backend (Port 5000)
│  + Prisma ORM   │  - JWT authentication
└────────┬────────┘  - Role & permission middleware
         │           - RESTful endpoints
         ↓
┌─────────────────┐
│  PostgreSQL 16  │  Database (Port 5433)
│                 │  - 28 normalized tables
└─────────────────┘  - Foreign key constraints
```

### Database Schema

**28 Tables** implementing full ERP data model:
- `users`, `roles`, `permissions` — RBAC system
- `departments` — Hierarchical org structure
- `assets`, `asset_categories`, `asset_field_values` — Flexible asset registry
- `asset_allocations`, `transfer_requests` — Custody tracking
- `resource_bookings`, `resources` — Time-slot booking
- `maintenance_requests`, `technicians` — Repair workflow
- `audit_cycles`, `audit_verifications`, `audit_discrepancies` — Compliance
- `activity_logs`, `system_notifications` — Audit trail

### API Architecture

**Layered Architecture:**
```
Routes → Controllers → Repositories → Prisma → Database
```

**Security:**
- JWT-based authentication on all routes except `/health` and `/login`
- Role-based middleware (`requirePermission`)
- Rate limiting on auth endpoints
- Input validation with Zod schemas

---

## Quick Start (One Command Setup)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- No Node.js, PostgreSQL, or other dependencies needed on host machine

### Run the Application

```bash
# Clone the repository
git clone <https://github.com/VRAJPATEL621204/assetflow_odoo-hackathon_team-gitignore.git>
cd assetflow_odoo-hackathon_team-gitignore

# Start all services
docker-compose up --build
```

Docker will:
1. Start PostgreSQL on port `5433`
2. Build and start the backend on port `5000`
3. Run database migrations and seed initial data
4. Build the React frontend and serve via nginx on port `3000`
5. Start Prisma Studio on port `5555` (optional database viewer)

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application UI |
| **Backend API** | http://localhost:5000 | RESTful API |
| **Health Check** | http://localhost:5000/health | Database connection status |
| **Prisma Studio** | http://localhost:5555 | Database viewer (optional) |

### Demo Credentials

```
Email:    admin@company.com
Password: admin123
Role:     Admin
```

**Pre-seeded roles:** Admin, Asset Manager, Department Head, Employee

### Optional: View Database with Prisma Studio

Prisma Studio is accessible at http://localhost:5555 for inspecting database schema and data.

If the port is not accessible, run:
```bash
docker exec -it assetflow-backend npx prisma studio
```

---

## User Roles & Workflows

### Admin
- Manages departments, asset categories, and audit cycles
- Promotes employees to Department Head or Asset Manager via Employee Directory
- Views organization-wide analytics

### Asset Manager
- Registers and allocates assets
- Approves transfers, maintenance requests, and audit discrepancies
- Approves asset returns and condition check-ins

### Department Head
- Views assets allocated to their department
- Approves allocation/transfer requests within their department
- Books shared resources on behalf of the department

### Employee
- Views assets allocated to them
- Books shared resources
- Raises maintenance requests
- Initiates return/transfer requests

### Complete Workflow Example

1. Admin creates departments, categories, and promotes employees to Asset Manager
2. Asset Manager registers a new laptop (status: Available)
3. Asset Manager allocates laptop to Employee A
4. Employee B tries to allocate same laptop → Blocked → "Transfer Request" option appears
5. Employee A raises maintenance request for laptop
6. Asset Manager approves → status changes to "Under Maintenance"
7. Technician completes repair → status back to "Available"
8. Admin creates audit cycle, assigns auditors
9. Auditors verify assets → discrepancy report auto-generated
10. Admin closes audit cycle → missing assets marked "Lost"

---

## Screenshots

Application screenshots available in `/screenshots` folder:

1. Login Screen — Authentication with role-based signup
2. Dashboard — KPI cards with overdue alerts and quick actions
3. Organization Setup — 3-tab interface (Departments, Categories, Employees)
4. Asset Directory — Search, filter, and lifecycle status tracking
5. Asset Allocation — Conflict prevention with transfer workflows
6. Resource Booking — Calendar view with overlap validation
7. Maintenance Management — Approval workflow with status tracking
8. Audit Cycles — Auditor assignment and discrepancy reporting
9. Reports & Analytics — Utilization trends and department summaries
10. Notifications — Real-time alerts with full activity log

---

## Project Structure

```
assetflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # 28-table data model
│   │   └── seed.js                # Initial roles, permissions, admin user
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── repositories/          # Database access layer
│   │   ├── routes/                # API endpoints
│   │   ├── middleware/            # Auth & error handling
│   │   └── index.js               # Express app entry
│   ├── Dockerfile
│   ├── package.json
│   └── .env                       # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # 10 main screens
│   │   ├── layout/                # Sidebar navigation
│   │   ├── config/                # API base URL
│   │   └── index.css              # Tailwind theme
│   ├── Dockerfile
│   ├── nginx.conf                 # SPA routing
│   └── package.json
│
├── docker-compose.yml             # 4-service orchestration
├── README.md
└── screenshots/
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All endpoints (except `/health` and `/users/login|register`) require JWT token:
```
Authorization: Bearer <token>
```

### Endpoints Overview

#### Users & Auth
- `POST /api/users/register` — Create employee account
- `POST /api/users/login` — Authenticate user
- `GET /api/users/profile` — Get current user profile

#### Organization
- `GET /api/org/departments` — List departments
- `POST /api/org/departments` — Create department (Admin)
- `GET /api/org/categories` — List asset categories
- `POST /api/org/categories` — Create category (Admin)
- `GET /api/org/employees` — List employees
- `PUT /api/org/employees/:id/role` — Promote employee (Admin)
- `GET /api/org/locations` — List locations
- `POST /api/org/locations` — Create location (Admin)

#### Assets
- `GET /api/assets` — List assets (with filters)
- `GET /api/assets/:id` — Get asset details + history
- `POST /api/assets` — Register asset (Asset Manager)
- `PUT /api/assets/:id` — Update asset (Asset Manager)

#### Allocations & Transfers
- `GET /api/allocations` — List allocations
- `POST /api/allocations` — Allocate asset (Asset Manager)
- `PUT /api/allocations/:id/return` — Return asset
- `GET /api/allocations/transfers` — List transfer requests
- `POST /api/allocations/transfers` — Create transfer request
- `PUT /api/allocations/transfers/:id/approve` — Approve transfer
- `PUT /api/allocations/transfers/:id/reject` — Reject transfer

#### Resource Booking
- `GET /api/bookings` — List bookings
- `GET /api/bookings/resources` — List bookable resources
- `POST /api/bookings` — Create booking
- `POST /api/bookings/resources` — Create resource (Admin)
- `PUT /api/bookings/:id/cancel` — Cancel booking

#### Maintenance
- `GET /api/maintenance/requests` — List maintenance requests
- `POST /api/maintenance/requests` — Raise request (Employee)
- `PUT /api/maintenance/requests/:id` — Update status (Asset Manager)
- `GET /api/maintenance/technicians` — List technicians
- `POST /api/maintenance/technicians` — Add technician (Admin)

#### Audits
- `GET /api/audits/cycles` — List audit cycles
- `POST /api/audits/cycles` — Create cycle (Asset Manager)
- `POST /api/audits/verify` — Verify asset (Auditor)
- `PUT /api/audits/cycles/:id/close` — Close cycle (Asset Manager)

#### Reports & Notifications
- `GET /api/reports/dashboard` — Dashboard KPIs
- `GET /api/reports/utilization` — Asset utilization data
- `GET /api/reports/dept-utilization` — Department summary
- `GET /api/reports/maintenance-frequency` — Maintenance stats
- `GET /api/reports/notifications` — User notifications
- `PUT /api/reports/notifications/read` — Mark all as read
- `PUT /api/reports/notifications/:id/read` — Mark single as read

---

## Development

### Local Development (without Docker)

**Prerequisites:** Node.js 18+, PostgreSQL on port `5433`

```bash
# Install dependencies
npm install

# Set up backend
cd backend
cp .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed

# Run dev servers (frontend + backend)
cd ..
npm run dev
```

Access at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Database Management

**Prisma Studio** at http://localhost:5555 (via Docker Compose)

**Alternative:** Use any PostgreSQL client:
```
Host:     localhost
Port:     5433
User:     cde
Password: cde_secret
Database: company_discovery
```

Recommended clients: TablePlus, pgAdmin, VS Code PostgreSQL extension

### Stop the Application

```bash
docker-compose down
```

**Full reset (wipe database):**
```bash
docker-compose down -v
```

---

## Known Limitations

- Email notifications use console logging only
- Reports are UI-rendered (no PDF export)
- Single-tenant design (no multi-org support)
- No purchase order or invoicing modules (out of scope)

## Future Enhancements

- Email/SMS notifications via Twilio/SendGrid
- PDF report generation
- QR code generation for asset tags
- Mobile app (React Native)
- Real-time updates via WebSockets
- ML-based predictions (asset failure, utilization forecasting)

---
Made by Team: gitignore
## Team

**Team gitignore** — Built during the Odoo Hackathon 2026

---

