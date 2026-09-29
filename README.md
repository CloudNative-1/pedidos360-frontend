# Pedidos360 Frontend

Aplicación web para autenticación y gestión de catálogo/pedidos. El backend aún no está configurado; la interfaz informa este estado y no muestra datos inventados.

## Tecnologías

- React y TypeScript
- Vite
- React Router
- `@azure/msal-browser` y `@azure/msal-react`
- Microsoft Entra ID

## Requisitos e inicio

Se requiere Node.js 20.19+ o 22.12+ y npm para Vite 8.

```bash
npm install
npm run dev
npm run build
npm run lint
```

Abre siempre el desarrollo en `http://localhost:5173`, el origen configurado para Entra ID y API Gateway.

## Variables de entorno

Crea `.env` a partir de `.env.example` y configura los valores de tus App Registrations. No publiques `.env`; está ignorado por Git. El Client ID y Tenant ID identifican aplicaciones/directorios, pero no son secretos. Esta SPA no debe contener `client_secret`, claves de AWS ni contraseñas.

```dotenv
VITE_AZURE_CLIENT_ID=<client-id-de-Pedidos360-Frontend>
VITE_AZURE_TENANT_ID=<tenant-id>
VITE_AZURE_REDIRECT_URI=http://localhost:5173
VITE_API_BASE_URL=
VITE_API_SCOPE=api://<client-id-de-Pedidos360-API>/catalog.read api://<client-id-de-Pedidos360-API>/catalog.write api://<client-id-de-Pedidos360-API>/orders.read api://<client-id-de-Pedidos360-API>/orders.write
```

`VITE_API_BASE_URL` permanece vacío hasta que se despliegue API Gateway. No se define una URL local o ficticia para el backend.

## Microsoft Entra ID

Registra dos aplicaciones en el tenant:

- **Pedidos360-Frontend**: aplicación SPA con Redirect URI `http://localhost:5173`.
- **Pedidos360-API**: expone `api://<client-id-de-Pedidos360-API>` y define permisos delegados.

Los scopes existentes son exactamente `catalog.read`, `catalog.write`, `orders.read` y `orders.write`. En `VITE_API_SCOPE` se solicitan con el prefijo `api://<client-id-de-Pedidos360-API>/`.

Los App Roles existentes son exactamente `Admin`, `Operador` y `Cliente`. Asigna estos roles a los usuarios/grupos en la aplicación empresarial de Pedidos360-API.

## Inicio de sesión y autorización

La ruta `/` es pública. Al elegir **Iniciar sesión con Microsoft**, MSAL usa la autoridad del tenant y el redirect configurado. Las rutas `/dashboard`, `/catalogo` y `/pedidos` requieren autenticación. `/catalogo` admite `Admin` y `Operador`; `/pedidos` admite `Admin`, `Operador` y `Cliente`.

Autenticación confirma que existe una sesión. Autorización determina qué puede consultar o intentar hacer esa cuenta. `RequireRole` consulta `roles` del access token de Pedidos360-API; el hook de autorización también lee `scp` del mismo token para ajustar la experiencia. Los roles y scopes no son equivalentes.

Estas comprobaciones del frontend son controles UX, no una frontera de seguridad. API Gateway deberá validar el JWT y el backend Python/Lambda deberá volver a autorizar roles, scopes y reglas de negocio en cada operación.

## Flujo de token

MSAL obtiene el access token destinado a Pedidos360-API mediante `acquireTokenSilent`; cuando hace falta interacción, solicita un redirect. `ApiClient` añade ese access token como `Authorization: Bearer <access_token>`. El ID token no se envía al backend. El token no se guarda manualmente: MSAL administra su caché.

MSAL Browser implementa Authorization Code Flow para SPA con PKCE y gestiona `state` y `nonce`. Esos valores no se construyen manualmente en el código de negocio. `decodeJwt()` solo decodifica el payload para inspeccionar claims; no valida firma, issuer, audience ni vigencia. Esa validación corresponde al authorizer.

En modo desarrollo, **TokenInspector** permite comprobar `aud`, `iss`, `sub`, `scp`, `roles` y `exp`. El token completo, si se necesita para la demostración, queda tras un detalle cerrado y solo se muestra en desarrollo.

## Rutas y datos

- `/`: inicio de sesión público.
- `/dashboard`: resumen de cuenta para cualquier usuario autenticado.
- `/catalogo`: consulta de catálogo para `Admin` y `Operador`.
- `/pedidos`: consulta/creación/cambio de estado según rol y scope.

Los endpoints preparados conservan nombres en español: `/catalogo`, `/catalogo/{id}`, `/pedidos`, `/pedidos/{id}` y `/pedidos/{id}/estado`. Mientras no exista API, catálogo y pedidos muestran el estado de backend pendiente y no crean datos de demostración.

## Cerrar sesión

El botón **Cerrar sesión** inicia el cierre de sesión de Entra ID y vuelve a `/`.

## Backend pendiente

API Gateway, su JWT Authorizer, el backend Python en AWS Lambda y DynamoDB todavía no forman parte de este frontend. Las respuestas 401/403/404/500 y los errores de conexión se presentan con mensajes comprensibles cuando el servicio esté conectado.
