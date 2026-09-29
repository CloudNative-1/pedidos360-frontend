// src/pages/Dashboard.tsx
//
// Página principal privada de Pedidos360.
// RequireAuth garantiza que solo pueda acceder un usuario autenticado.

import { useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Boxes, ClipboardList, Plus, UserRound } from 'lucide-react';

import { TokenInspector } from '../components/TokenInspector';
import { useAuthorization } from '../components/useAuthorization';
import { PageHeader } from '../components/layout/PageHeader';

export function Dashboard() {
  const { instance, accounts } = useMsal();
  const authorization = useAuthorization();

  const currentUser =
    instance.getActiveAccount() ??
    accounts[0] ??
    null;

  const isAdmin = authorization.roles.includes('Admin');
  const isOperator = authorization.roles.includes('Operador');
  const isClient = authorization.roles.includes('Cliente');

  const shortcuts = [
    ...(isAdmin || isOperator ? [{ to: '/catalogo', title: 'Catálogo', description: 'Productos y disponibilidad', icon: Boxes }] : []),
    ...(isAdmin || isOperator || isClient ? [{ to: '/pedidos', title: isClient ? 'Mis pedidos' : 'Pedidos', description: 'Consulta y seguimiento', icon: ClipboardList }] : []),
    ...(isClient ? [{ to: '/pedidos#nuevo-pedido', title: 'Crear pedido', description: 'Registrar una nueva solicitud', icon: Plus }] : []),
  ];

  return (
    <section className="page-stack dashboard-page">
      <PageHeader
        eyebrow={isAdmin ? 'Administración' : isOperator ? 'Operación' : 'Cuenta de cliente'}
        title={`Hola, ${currentUser?.name?.split(' ')[0] ?? 'bienvenido'}`}
        subtitle="¿Qué necesitas gestionar hoy?"
      />
      <section className="dashboard-welcome surface">
        <div className="dashboard-welcome-copy">
          <span className="dashboard-icon"><UserRound size={21} /></span>
          <div>
            <p className="card-overline">Sesión activa</p>
            <h2>{currentUser?.name ?? 'Cuenta Microsoft'}</h2>
            <p className="muted-copy">{currentUser?.username ?? 'Usuario autenticado mediante Microsoft Entra ID'}</p>
          </div>
        </div>
        <div className="role-list" aria-label="Roles asignados">
          {authorization.loading ? <span className="role-chip">Cargando rol…</span> :
            authorization.roles.map((role) => <span className="role-chip" key={role}>{role}</span>)}
        </div>
      </section>

      <section className="dashboard-shortcuts" aria-labelledby="shortcuts-heading">
        <div className="section-heading">
          <div><p className="page-eyebrow">ESPACIOS DE TRABAJO</p><h2 id="shortcuts-heading">Accesos rápidos</h2></div>
        </div>
        <div className="shortcut-grid">
          {shortcuts.map(({ to, title, description, icon: Icon }) => (
            <Link to={to} className="shortcut-card" key={title}>
              <span className="shortcut-icon"><Icon size={20} strokeWidth={1.8} /></span>
              <span className="shortcut-copy"><strong>{title}</strong><small>{description}</small></span>
              <ArrowUpRight className="shortcut-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>

      {import.meta.env.DEV && (
        <section className="surface token-surface">
          <TokenInspector />
        </section>
      )}
    </section>
  );
}