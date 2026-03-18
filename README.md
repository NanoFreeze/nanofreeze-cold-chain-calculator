## NF Portal Interno

Portal interno de NANOFREEZE para la visualización y gestión de información de clientes, puntos de venta y dispositivos, construido con **React** y **Vite**. La aplicación se integra con **Auth0** para la autenticación, consume APIs internas para lectura de datos tabulares y utiliza diversos componentes visuales (tablas, gráficos, mapas) para el seguimiento de la información.

### Tecnologías principales

- **Frontend**: React 19 + Vite
- **Lenguaje**: JavaScript / TypeScript (según carpeta)
- **Ruteo**: `react-router-dom`
- **Estilos/UI**: MUI, TailwindCSS, componentes propios
- **Autenticación**: Auth0 (`@auth0/auth0-react`, contexto `AuthContext`)
- **Gráficos**: Recharts
- **Mapas**: Leaflet + React Leaflet
- **Firebase**: para integración con servicios de Firebase

### Estructura general del proyecto

- `src/main.jsx`: punto de entrada de la aplicación.
- `src/Routes/Routes.tsx`: definición de las rutas principales, incluyendo rutas públicas y protegidas.
- `src/Routes/ProtectedRoutes.tsx`: encapsula las rutas que requieren sesión iniciada, usando `AuthContext`.
- `src/Contexts/AuthContext`: contexto de autenticación y manejo de sesión (token, usuario, login/logout).
- `src/Environments/Environments.ts`: configuración de URLs base para las APIs (por ejemplo, tablas).
- `src/Pages`: páginas principales:
  - `Auth`: pantallas de login y callback de Auth0.
  - `App`: layout y estructura general de la aplicación autenticada.
  - `Clients`: listado de clientes, detalle de cliente, puntos de venta y dispositivos.
  - `Alerts`, `Reports`, `Settings`: secciones adicionales del portal.
- `src/Hooks`: hooks reutilizables para el acceso a datos y lógica de UI:
  - `useTable`: consumo genérico de tablas (listado, conteos, queries).
  - `useDynamicForm`, `useDynamicInstance`, `useFilters`, etc.
- `src/Components`: componentes reutilizables (tablas genéricas, formularios dinámicos, barra lateral, gráficos, mapas, etc.).

### Requisitos previos

- **Node.js** 18 o superior (recomendado LTS).
- **npm** (incluido con Node).
- Acceso a las **credenciales de Auth0** y variables de entorno requeridas (dominio, client ID, etc.).
- Configuración de **URLs de API** en `src/Environments/Environments.ts`.

### Instalación

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd nf_portal_interno
```

2. Instalar dependencias:

```bash
npm install
```

### Ejecución en desarrollo

Iniciar el servidor de desarrollo de Vite:

```bash
npm run dev
```

Por defecto, Vite expone la aplicación en `http://localhost:5173` (o el puerto configurado). Revisa la consola después de ejecutar el comando para confirmar la URL.

### Build para producción

Generar la compilación optimizada:

```bash
npm run build
```

Previsualizar el build de producción:

```bash
npm run preview
```

### Scripts disponibles

- **`npm run dev`**: inicia el servidor de desarrollo.
- **`npm run build`**: construye la aplicación para producción.
- **`npm run preview`**: levanta un servidor para previsualizar el build.
- **`npm run lint`**: ejecuta ESLint sobre el código del proyecto.

### Autenticación y rutas protegidas

- La autenticación se gestiona mediante **Auth0** y el contexto `AuthContext` en `src/Contexts/AuthContext`.
- `ProtectedRoutes` revisa el estado de `isAuthenticated`:
  - Si el usuario **no** está autenticado, redirige a `/auth/login`.
  - Si está autenticado, renderiza el layout principal (`Layout`) y las rutas hijas:
    - `/clients` – listado de clientes.
    - `/clients/:id_client` – detalle de cliente.
    - `/clients/:id_client/sale-points/:id_point_of_sale` – detalle de punto de venta.
    - `/clients/:id_client/sale-points/:id_point_of_sale/devices/:id_device` – detalle de dispositivo.
    - `/reports`, `/alerts`, `/settings` – secciones adicionales.

### Acceso a datos de tablas

El hook `useTable` (`src/Hooks/useTable.js`) encapsula el acceso a una API de tablas:

- Usa el token del `AuthContext` para autorizar las peticiones.
- La URL base se obtiene de `Environments.tables` y se construye como `\${Environments.tables}rows`.
- Permite distintos **modos** (`mode`):
  - `"rows"` (por defecto): `GET /rows/:tableName` para obtener filas de una tabla.
  - `"count"`: `GET /rows/:tableName/count` para obtener el total de registros.
  - `"query"`: `POST /rows/query/:tableName` para ejecutar consultas con filtros (`queryOptions` en el body).
  - `"queryCount"`: `POST /rows/query/:tableName/count` para obtener contadores filtrados.
- Maneja estados de **carga**, **error** y expone un método `reload()` para recargar datos.

A alto nivel, la integración con la API de `tables` funciona así:

- **Configuración**: en `src/Environments/Environments.ts` se define `Environments.tables` con la URL base del servicio de tablas.
- **Autenticación**: `useTable` utiliza el `token` del `AuthContext` y lo envía en el header `Authorization: Bearer <token>`.
- **Consumo desde páginas**: las páginas de clientes (`ClientsListTable`, `DevicesTable`, `PointsTable`, etc.) consumen `useTable` para obtener los datos y mostrarlos en componentes de tabla genéricos (`GenericTable` y otros).

### Integración con API App Creator

El hook `useAppCreator` (`src/Hooks/useAppCreator.js`) encapsula el acceso a la API de **App Creator** (apps, módulos, elementos, despliegues):

- Usa el token del `AuthContext` para autorizar las peticiones (`Authorization: Bearer <token>`).
- La URL base se obtiene de `Environments.appCreator`. Debe terminar en `/`, por ejemplo:
  - `https://nanofreeze.app-creator.ibisagroup.com/api/v1/`
- A partir de esa base, construye rutas como:
  - `GET /apps`
  - `GET /apps/:id`
  - `GET /apps/:id/structure`
  - `GET /modules`, `GET /elements`, `GET /deploys`, etc.
- Permite pasar **opciones** para construir la URL:
  - `id`: para obtener un recurso por identificador (`/apps/1`).
  - `subPath`: subruta tras el id (`/apps/1/structure`, `/apps/1/dataflows`, etc.).
  - `queryParams`: objeto con parámetros de query (`?limit=10&page=1&status=active&count=true`).
- Maneja estados de **carga**, **error** y expone un método `reload()` para relanzar la petición con los mismos parámetros.

De forma simplificada, la integración con la API de App Creator sigue este flujo:

- **Configuración**: en `src/Environments/Environments.ts` se define `Environments.appCreator` y en el entorno se debe configurar la variable (por ejemplo `VITE_APP_APP_CREATOR`).
- **Construcción de URLs**: `useAppCreator` utiliza un helper interno (`buildUrl`) para combinar:
  - recurso (`apps`, `modules`, `elements`, `deploys`),
  - `id` opcional,
  - `subPath` opcional,
  - y `queryParams`.
- **Consumo desde UI**: las vistas que necesitan metadatos o estructura de aplicaciones (por ejemplo, formularios dinámicos, módulos o elementos configurables) llaman a `useAppCreator` para obtener esos datos y renderizar la UI correspondiente.

### Variables de entorno y configuración

Aunque este README no incluye las claves exactas, típicamente deberás configurar:

- Variables relacionadas con **Auth0** (dominio, client ID, audience, etc.).
- URLs de servicios de backend (por ejemplo, base URL para tablas en `Environments.tables`).
- Configuración de Firebase (ver `src/Firebase`).

Revisa los archivos de entorno (`.env`, `.env.local`, etc.) y `Environments.ts` para conocer los nombres exactos de las variables utilizadas en tu entorno.

### Estilo de código y linting

El proyecto utiliza **ESLint** con la configuración base de `@eslint/js`, `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`. Se recomienda:

- Ejecutar `npm run lint` antes de crear PRs o desplegar.
- Mantener un estilo consistente acorde con las reglas definidas.

### Contribución

1. Crear una rama desde `main` para los cambios.
2. Realizar las modificaciones necesarias y añadir pruebas manuales o automáticas según aplique.
3. Ejecutar `npm run lint` y asegurarse de que no haya errores.
4. Abrir un Pull Request describiendo claramente los cambios y su motivación.

### Notas adicionales

- Este documento es una guía general. Si en el futuro se añaden nuevos módulos (por ejemplo, más secciones del portal, nuevos hooks o servicios), se recomienda actualizar este `README.md` para mantener la documentación alineada con el estado actual del proyecto.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
