// src/pages/Dashboard.tsx
//
// Página principal privada de Pedidos360.
// RequireAuth garantiza que solo pueda acceder un usuario autenticado.

import { useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';

import { TokenInspector } from '../components/TokenInspector';
import { useAuthorization } from '../components/useAuthorization';

export function Dashboard() {
  const { instance, accounts } = useMsal();
  const authorization = useAuthorization();

  const currentUser =
    instance.getActiveAccount() ??
    accounts[0] ??
    null;

  const initial = currentUser?.name?.trim().charAt(0).toUpperCase() || 'P';

  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <div className="avatar">
          {initial}
        </div>

        <div>
          <p className="eyebrow">Inicio</p>
          <h1>Hola, {currentUser?.name ?? 'bienvenido'}.</h1>

          <p className="subtitle">
            Sesión iniciada mediante Microsoft Entra ID.
          </p>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="surface">
          <h2>Tu cuenta</h2>

          <div className="user-details">
            <div className="detail-item">
              <span>Nombre</span>

              <strong>
                {currentUser?.name ?? 'No disponible'}
              </strong>
            </div>
            <div className="detail-item">
              <span>Correo o usuario</span>
              <strong>{currentUser?.username ?? 'No disponible'}</strong>
            </div>
          </div>
        </section>

        <section className="surface">
          <h2>Áreas de trabajo</h2>

          <p className="subtitle">
            Consulta las secciones disponibles para tu cuenta.
          </p>

          <div className="dashboard-summary">
            {authorization.roles.some((role) => role === 'Admin' || role === 'Operador') && (
              <Link to="/catalogo" className="summary-link">
                <strong>Catálogo</strong>
                <span>Productos y disponibilidad</span>
              </Link>
            )}

            {authorization.roles.some((role) => role === 'Admin' || role === 'Operador' || role === 'Cliente') && (
              <Link to="/pedidos" className="summary-link">
                <strong>Pedidos</strong>
                <span>Consulta y seguimiento</span>
              </Link>
            )}
          </div>
        </section>
      </div>

      {import.meta.env.DEV && (
        <section className="surface token-surface">
          <TokenInspector />
        </section>
      )}
    </section>
  );
}