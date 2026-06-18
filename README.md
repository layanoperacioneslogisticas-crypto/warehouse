# Gestor Visual de Ubicaciones de Almacen

Aplicacion full stack para gestionar bodegas, zonas, ubicaciones e inventario con un mapa visual 2D.

## Stack

- Frontend: React, Vite, TypeScript, Bootstrap, React Router, TanStack Query, TanStack Table, React Flow
- Backend: Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, Zod
- Deploy: Railway

## Estructura

```text
warehouse-location-manager/
├── backend/
└── frontend/
```

## Backend

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Variables en `backend/.env.example`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Variables en `frontend/.env.example`.

## Credenciales seed

- `admin@demo.com`
- `Admin123456`

## Notas

- El backend expone endpoints REST para autenticacion, maestros, inventario, layout y reportes.
- El frontend consume los endpoints reales; no usa datos simulados en las pantallas base.
- El mapa visual usa React Flow y persiste coordenadas de ubicaciones.
