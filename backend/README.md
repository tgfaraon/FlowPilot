# FlowPilot Backend

FlowPilot backend provides the workflow orchestration engine and API services. It supports tenant management, workflow execution, pause/resume/cancel actions, and role‑based authentication.

## Tech Stack

- Node.js + TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication with role‑based access
- REST API endpoints

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/flowpilot-backend.git
   cd flowpilot/backend

2. Install dependencies:
npm install

3. Configure environment variables in .env:

DATABASE_URL=postgresql://user:password@localhost:5432/flowpilot
JWT_SECRET=your-secret

4. Run migrations and seed data:

npx prisma migrate dev
npx prisma db seed

5. Start the server:

npm run dev

## API Overview
POST /auth/login – authenticate user, returns JWT

GET /workflows – list workflows for tenant

POST /workflows/:id/resume – resume workflow

POST /workflows/:id/cancel – cancel workflow

GET /logs – fetch execution logs

## Role‑Based Access
Platform Admin: manage tenants and global workflows

Tenant Admin: manage workflows within a tenant

End User: view assigned workflows and statuses