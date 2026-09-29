// src/pages/PanelOperador.tsx
//
// Panel de Operaciones (rol Operador). Accesos operativos: ver el catálogo
// (solo lectura) y gestionar pedidos (estados). No ofrece administración.
import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { ArrowUpRight, Boxes, ClipboardList, UserRound } from 'lucide-react';

import { useAuthorization } from '../components/useAuthorization';
import { PageHeader } from '../components/layout/PageHeader';
import { resolveActiveAccount } from '../auth/activeAccount';

export function PanelOperador() {
  const { instance, accounts } = useMsal();
  const authorization = useAuthorization();
  const account = resolveActiveAccount(instance, accounts);

  return (
    <section className="page-stack dashboard-page">
      <PageHeader
        eyebrow="Operación"
        title="Panel de Operaciones"
        subtitle="Consulta el catálogo y gestiona los pedidos del día."
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

      <section className="dashboard-shortcuts" aria-labelledby="operator-shortcuts-heading">
        <div className="section-heading">
          <div><p className="page-eyebrow">ACCESOS</p><h2 id="operator-shortcuts-heading">Trabajo diario</h2></div>
        </div>
        <div className="shortcut-grid">
          <Link to="/catalogo" className="shortcut-card">
            <span className="shortcut-icon"><Boxes size={20} strokeWidth={1.8} /></span>
            <span className="shortcut-copy"><strong>Ver catálogo</strong><small>Consulta de productos, precios y stock (solo lectura)</small></span>
            <ArrowUpRight className="shortcut-arrow" size={17} />
          </Link>
          <Link to="/pedidos" className="shortcut-card">
            <span className="shortcut-icon"><ClipboardList size={20} strokeWidth={1.8} /></span>
            <span className="shortcut-copy"><strong>Gestionar pedidos</strong><small>Aceptar, preparar y despachar pedidos</small></span>
            <ArrowUpRight className="shortcut-arrow" size={17} />
          </Link>
        </div>
      </section>

      <p className="security-note">El catálogo es de solo lectura para Operador: las opciones de crear, editar o eliminar no aparecen y el backend las rechaza con 403.</p>
    </section>
  );
}