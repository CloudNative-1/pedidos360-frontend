// src/App.tsx
//
// Configuración principal de navegación y rutas de Pedidos360.
//
// RequireAuth:
// - Comprueba que exista una sesión iniciada.
//
// RequireRole:
// - Comprueba que el usuario tenga al menos uno de los roles
//   permitidos para acceder a una ruta.
//
// Las rutas utilizan nombres en español para mantener
// consistencia dentro del proyecto.

import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom';

import {
  useIsAuthenticated,
  useMsal,
} from '@azure/msal-react';

import { InteractionStatus } from '@azure/msal-browser';

import { loginRequest } from './auth/authConfig';
import { RequireAuth } from './auth/RequireAuth';
import { RequireRole } from './auth/RequireRole';
import { useAuthorization } from './components/useAuthorization';

import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Catalogo } from './pages/Catalogo';
import { Pedidos } from './pages/Pedidos';

import './css/App.css';

const ROLES_CATALOGO = ['Admin', 'Operador'] as const;
const ROLES_PEDIDOS = ['Admin', 'Operador', 'Cliente'] as const;

function Nav() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const authorization = useAuthorization();
  const canSeeCatalog = authorization.roles.some((role) => role === 'Admin' || role === 'Operador');
  const canSeeOrders = authorization.roles.some((role) => role === 'Admin' || role === 'Operador' || role === 'Cliente');

  const handleLogin = () => {
    if (inProgress === InteractionStatus.None) {
      instance
        .loginRedirect(loginRequest)
        .catch((error) => {
          console.error(
            'Error al iniciar sesión:',
            error,
          );
        });
    }
  };

  const handleLogout = () => {
    if (inProgress === InteractionStatus.None) {
      instance
        .logoutRedirect({
          postLogoutRedirectUri: '/',
        })
        .catch((error) => {
          console.error(
            'Error al cerrar sesión:',
            error,
          );
        });
    }
  };

  const linkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? 'nav-link active'
      : 'nav-link';

  return (
    <header className="navbar">

      <NavLink
        to="/"
        className="logo"
      >
        <span>Pedidos360</span>
      </NavLink>

      {isAuthenticated && (
        <nav className="nav-links">

          <NavLink
            to="/dashboard"
            className={linkClass}
          >
            Inicio
          </NavLink>

          {canSeeCatalog && (
            <NavLink to="/catalogo" className={linkClass}>
              Catálogo
            </NavLink>
          )}

          {canSeeOrders && (
            <NavLink to="/pedidos" className={linkClass}>
              Pedidos
            </NavLink>
          )}

        </nav>
      )}

      <div className="nav-actions">

        {isAuthenticated ? (
          <button
            className="btn btn-logout"
            onClick={handleLogout}
            disabled={
              inProgress !==
              InteractionStatus.None
            }
          >
            Cerrar sesión
          </button>
        ) : (
          <button
            className="btn btn-login"
            onClick={handleLogin}
            disabled={
              inProgress !==
              InteractionStatus.None
            }
          >
            Iniciar sesión
          </button>
        )}

      </div>

    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>

      <div className="layout">

        <Nav />

        <main className="container">

          <Routes>

            {/* ============================== */}
            {/* RUTA PÚBLICA                   */}
            {/* ============================== */}

            <Route
              path="/"
              element={<Landing />}
            />

            {/* ============================== */}
            {/* RUTAS AUTENTICADAS             */}
            {/* ============================== */}

            <Route element={<RequireAuth />}>

              {/* Dashboard:
                  cualquier usuario autenticado */}
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              {/* ============================== */}
              {/* CATÁLOGO                       */}
              {/* ============================== */}

              <Route
                element={
                  <RequireRole
                    roles={ROLES_CATALOGO}
                  />
                }
              >
                <Route
                  path="/catalogo"
                  element={<Catalogo />}
                />
              </Route>

              {/* ============================== */}
              {/* PEDIDOS                        */}
              {/* ============================== */}

              <Route
                element={
                  <RequireRole
                    roles={ROLES_PEDIDOS}
                  />
                }
              >
                <Route
                  path="/pedidos"
                  element={<Pedidos />}
                />
              </Route>

            </Route>

            {/* ============================== */}
            {/* RUTA NO ENCONTRADA              */}
            {/* ============================== */}

            <Route
              path="*"
              element={<Landing />}
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>
  );
}