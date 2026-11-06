# RAWR

Aplicación web con stack **MySQL + Express + React + Node.js (TypeScript)**.

## Requisitos

- Node.js 18+
- MySQL 8+ (para etapas futuras)

## Estructura del proyecto

```
rawr/
├── client/     Frontend (React + Vite + TypeScript)
├── server/     Backend (Express + TypeScript)
├── SPEC.md     Decisiones técnicas
└── README.md
```

## Instalación

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
cp .env.example .env
```

## Desarrollo

En terminales separadas:

```bash
# Frontend — http://localhost:5173
cd client
npm run dev

# Backend — http://localhost:3000
cd server
npm run dev
```

## Scripts disponibles

### Client

| Script  | Descripción              |
|---------|--------------------------|
| `dev`   | Servidor de desarrollo   |
| `build` | Build de producción      |
| `preview` | Preview del build      |

### Server

| Script  | Descripción              |
|---------|--------------------------|
| `dev`   | Servidor con hot reload  |
| `build` | Compila TypeScript       |
| `start` | Ejecuta build compilado  |

## Documentación

Ver [SPEC.md](./SPEC.md) para decisiones técnicas y alcance de la etapa actual.
