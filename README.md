# FlowPilot Frontend

FlowPilot is a workflow orchestration engine with a React + TypeScript + Vite frontend. It provides dashboards and monitoring tools for tenants and admins to manage automated workflows with support for pause, resume, cancel, and parallel execution.

## Features

- Tenant Dashboard: overview of workflows per tenant
- Workflow Monitor: real‑time timeline, metrics, and execution logs
- Workflow Detail: step‑by‑step breakdown with status badges
- Role‑based access: JWT authentication with protected routes
- Workflow actions: resume and cancel directly from the UI

## Tech Stack

- Frontend: React, TypeScript, Vite
- Styling: TailwindCSS
- Backend: Node.js, Prisma, PostgreSQL (see backend repo)
- Auth: JWT with role‑based access
- API: REST endpoints for workflows, tenants, and admin actions

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/flowpilot.git
   cd flowpilot/frontend

## Install dependencies:

bash
npm install
Start the dev server:

bash
npm run dev
Open http://localhost:5173 in your browser.

## Demo Accounts

To explore the application without setup, you can use the following demo logins:

### Platform Admin
- Email: tylergfaraon@gmail.com
- Password: SuperSecretPassword123

### Tenant Admin
- Email: sample.admin@example.com
- Password: password123

### End User
- Email: tgfaraon@gmail.com
- Password: password123

These accounts allow you to view the different dashboards:
- Platform Admin: manage tenants and global workflows
- Tenant Admin: manage workflows within a tenant
- End User: view assigned workflows and their statuses

## Screenshots

<img width="491" height="911" alt="image" src="https://github.com/user-attachments/assets/a683abae-e194-4dc2-a071-4a17e16dff1e" />


<img width="504" height="906" alt="image" src="https://github.com/user-attachments/assets/e4b15d7b-e3fc-4169-9f2d-f798a25ac76a" />


<img width="505" height="911" alt="image" src="https://github.com/user-attachments/assets/ecc92af3-48a5-4387-8da1-1ab97c34fef7" />


## Architecture
WorkflowService: centralized API client for workflows

Components: reusable UI pieces (StepCard, WorkflowTimeline, WorkflowMetrics)

Pages: TenantAdminDashboard, WorkflowMonitor, WorkflowDetail

State management: local state hooks per page

## Portfolio Notes
FlowPilot demonstrates:

Full‑stack engineering with workflow orchestration

Type‑safe frontend integrated with backend APIs

Real‑time monitoring and admin controls

Production‑ready authentication and role management
