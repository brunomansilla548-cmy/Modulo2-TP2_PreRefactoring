# RAWR — Especificación técnica

Documento de decisiones técnicas para la etapa inicial del proyecto.

## Stack

| Capa       | Tecnología                          |
|------------|-------------------------------------|
| Frontend   | React 19 + TypeScript + Vite        |
| Backend    | Node.js + Express + TypeScript      |
| Base de datos | MySQL (driver: `mysql2`)       |

## Arquitectura

Se adoptó un **monorepo con dos paquetes independientes**:

```
rawr/
├── client/   → aplicación React (frontend)
├── server/   → API Express (backend)
├── SPEC.md
└── README.md
```

**Motivo:** separar responsabilidades, permitir despliegues independientes y mantener dependencias aisladas entre frontend y backend.

## Decisiones técnicas

### 1. Vite como bundler del frontend

- Generación rápida de proyectos y HMR en desarrollo.
- Template oficial `react-ts` como base mínima.

### 2. `tsx` para ejecutar TypeScript en el backend

- Permite correr el servidor en desarrollo sin compilar manualmente.
- Script `dev`: `tsx watch src/index.ts`.

### 3. Estructura de carpetas del frontend

```
client/src/
├── components/   → componentes reutilizables de UI
├── pages/        → vistas/páginas por ruta
├── features/     → módulos por dominio funcional (p. ej. categorías)
├── hooks/        → custom hooks compartidos entre features (opcional)
├── services/     → comunicación con la API y persistencia local del cliente
├── types/        → tipos TypeScript compartidos del frontend
├── utils/        → funciones auxiliares
└── styles/       → estilos globales y compartidos
```

### 4. Estructura de carpetas del backend

```
server/src/
├── config/       → variables de entorno y configuración de MySQL
├── routes/       → definición de rutas Express
├── middleware/   → middlewares de Express
├── types/        → tipos TypeScript del backend
└── index.ts      → punto de entrada del servidor
```

### 5. Variables de entorno

- Archivo de referencia: `server/.env.example`
- Librería: `dotenv`
- La conexión a MySQL **no está implementada** en esta etapa; solo se define la configuración base.

### 6. CORS habilitado en el servidor

- Necesario para que el frontend (puerto distinto en desarrollo) pueda consumir la API más adelante.
- Sin rutas ni lógica de negocio por ahora.

### 7. Puertos por defecto

| Servicio  | Puerto |
|-----------|--------|
| Frontend  | 5173 (Vite) |
| Backend   | 3000 |

### 8. Dependencias instaladas

**Frontend (`client`):**
- `react`, `react-dom`
- Dev: `vite`, `typescript`, `@vitejs/plugin-react`

**Backend (`server`):**
- `express`, `mysql2`, `cors`, `dotenv`
- Dev: `typescript`, `tsx`, `@types/express`, `@types/cors`, `@types/node`

No se agregaron librerías de routing, estado global, ORM ni UI en esta etapa.

### 9. Convención para hooks de dominio

- Los hooks usados **solo por un feature** viven dentro de ese feature (ej. `features/categories/useCategories.ts`).
- La carpeta `hooks/` en la raíz de `client/src` queda para hooks **reutilizados** entre varios módulos.

## Feature: categorías personalizadas (vertical slice)

Primer módulo de dominio en el frontend. Objetivo: CRUD de categorías con nombre definido por el usuario, como base para clasificar debates en etapas futuras. **No** es el flujo completo de producto; es un slice acotado para establecer la estructura `features/`.

### Alcance de esta feature

| Incluye | No incluye |
|---------|------------|
| Crear, listar, editar y eliminar categorías en el cliente | API REST, MySQL ni persistencia en servidor |
| Persistencia en `localStorage` del navegador | Autenticación ni categorías por usuario |
| Validación de nombre (reglas abajo) | Descripción, color, orden drag-and-drop |
| Integración en `App.tsx` (sin React Router por ahora) | Enlace con debates o contenido (aún inexistente) |
| Lista inicial **vacía** (sin categorías precargadas) | Migraciones de schema en storage |

### Modelo de datos (cliente)

```ts
Category {
  id: string    // identificador estable (generado en cliente)
  name: string  // nombre visible, personalizado por el usuario
}
```

- Orden en UI: alfabético por `name` (locale del navegador).
- En el futuro, otros módulos referenciarán categorías por `id`.

### Persistencia local

| Concepto | Valor |
|----------|--------|
| Clave | `rawr:categories:v1` |
| Formato | JSON: array de `Category` |
| Lectura corrupta o inválida | Tratar como lista vacía (no bloquear la app) |
| Cambio de schema | Incrementar versión en la clave o documentar reset manual; **sin** migraciones automáticas en v1 |

Servicio previsto: `client/src/services/categoryStorage.ts` con `loadCategories()` y `saveCategories(categories)`.

### Validación de `name`

Aplicar en función pura (ej. `features/categories/validateCategory.ts`) al crear y al editar:

1. `trim`; no permitir cadena vacía tras recortar espacios.
2. Longitud: mínimo **2**, máximo **50** caracteres (constantes en `categoryConfig.ts`).
3. Unicidad en la lista actual: comparación **case-insensitive**; al editar, excluir la categoría con el mismo `id`.
4. Normalización para unicidad: `trim` + comparación con `toLowerCase()` (sin NFC ni reglas i18n avanzadas en v1).

Mensajes de error en español, mostrados junto al campo del formulario.

### Eliminación

- Confirmación mínima antes de borrar (p. ej. `window.confirm` o equivalente inline).
- Borrar por `id`; si no existe, ignorar sin error fatal.

### Estructura de archivos prevista

```
client/src/
├── features/categories/
│   ├── categoryConfig.ts       → clave storage, límites de longitud
│   ├── validateCategory.ts
│   ├── useCategories.ts
│   └── CategoriesSection.tsx   → UI del slice (lista + formulario)
├── services/
│   └── categoryStorage.ts
├── types/
│   └── index.ts                → export de Category (si se centraliza ahí)
└── App.tsx                     → monta CategoriesSection
```

### Criterios de aceptación (manual)

1. Crear categorías y verlas tras recargar la página.
2. Rechazar nombre duplicado (misma cadena ignorando mayúsculas).
3. Editar nombre válido y persistir cambio.
4. Eliminar con confirmación.

### Evolución futura (fuera de este slice)

- Sincronización vía API y MySQL cuando AGENTS/SPEC lo permitan.
- Categorías por usuario cuando exista autenticación.
- Reglas de borrado si una categoría tiene debates asociados.

## Fuera de alcance (etapa actual)

- Flujos de producto completos (feed de debates, empresas, pagos, etc.)
- Lógica de negocio en el **servidor**
- Conexión activa a MySQL
- Migraciones o esquema de base de datos
- Autenticación
- Tests automatizados

## Pendiente de definir

- ORM o query builder (ej. Prisma, Drizzle, Knex) vs SQL directo con `mysql2`
- Librería de routing en React (ej. React Router)
- Estrategia de estilos (CSS modules, Tailwind, etc.)
- Proxy de desarrollo en Vite hacia el backend
