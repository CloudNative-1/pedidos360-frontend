// src/pages/InicioCliente.tsx
//
// Inicio del Cliente: experiencia propia, sin acceso al catálogo
// administrativo. Accesos a "Comprar" y "Mis pedidos".
import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { ArrowUpRight, ClipboardList, ShoppingBag, UserRound } from 'lucide-react';

import { useAuthorization } from '../components/useAuthorization';
import { PageHeader } from '../components/layout/PageHeader';
import { resolveActiveAccount } from '../auth/activeAccount';

export function InicioCliente() {
  const { instance, accounts } = useMsal();
  const authorization = useAuthorization();
  const account = resolveActiveAccount(instance, accounts);

  return (
    <section className="page-stack dashboard-page">
      <PageHeader
        eyebrow="Cuenta de cliente"
        title={`Hola, ${account?.name?.split(' ')[0] ?? 'bienvenido'}`}
        subtitle="Elige qué quieres hacer hoy."
      />

      <section className="dashboard-welcome surface">
        <div className="dashboard-welcome-copy">
          <span className="dashboard-icon"><UserRound size={21} /></span>
          <div>
            <p className="card-overline">Sesión activa</p>
            <h2>{account?.name ?? 'Cuenta Microsoft'}</h2>
            <p className="muted-copy">{account?.username ?? 'Usuario autenticado mediante Microsoft Entra ID'}</p>
          </div>
        </div>
        <div className="role-list" aria-label="Roles asignados">
          {authorization.roles.map((role) => <span className="role-chip" key={role}>{role}</span>)}
        </div>
      </section>

      <section className="dashboard-shortcuts" aria-labelledby="client-shortcuts-heading">
        <div className="section-heading">
          <div><p className="page-eyebrow">COMPRAR</p><h2 id="client-shortcuts-heading">Tus opciones</h2></div>
        </div>
        <div className="shortcut-grid">
          <Link to="/comprar" className="shortcut-card">
            <span className="shortcut-icon"><ShoppingBag size={20} strokeWidth={1.8} /></span>
            <span className="shortcut-copy"><strong>Comprar</strong><small>Ver productos disponibles y crear un pedido</small></span>
            <ArrowUpRight className="shortcut-arrow" size={17} />
          </Link>
          <Link to="/pedidos" className="shortcut-card">
            <span className="shortcut-icon"><ClipboardList size={20} strokeWidth={1.8} /></span>
            <span className="shortcut-copy"><strong>Mis pedidos</strong><small>Consultar el estado de tus pedidos</small></span>
            <ArrowUpRight className="shortcut-arrow" size={17} />
          </Link>
        </div>
      </section>
    </section>
  );
}