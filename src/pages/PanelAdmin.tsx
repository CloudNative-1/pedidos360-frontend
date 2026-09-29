// src/pages/PanelAdmin.tsx
//
// Panel de Administración (rol Admin). Muestra la identidad real de la
// cuenta, accesos rápidos y contadores REALES derivados de las respuestas
// de la API (catálogo y pedidos). Ningún número está hardcodeado.
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { ArrowUpRight, Boxes, ClipboardList, PackageOpen, ShoppingCart, UserRound } from 'lucide-react';

import { useApi } from '../components/useApi';
import { useAuthorization } from '../components/useAuthorization';
import { apiErrorMessage } from '../api/client';
import { listarCatalogo } from '../api/catalogo';
import { listarPedidos } from '../api/pedidos';
import { PageHeader } from '../components/layout/PageHeader';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { TokenInspector } from '../components/TokenInspector';
import { resolveActiveAccount } from '../auth/activeAccount';

interface AdminStats {
  productos: number;
  agotados: number;
  pedidos: number;
  pendientes: number;
}

export function PanelAdmin() {
  const { instance, accounts } = useMsal();
  const api = useApi();
  const authorization = useAuthorization();
  const account = resolveActiveAccount(instance, accounts);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!api || authorization.loading) return;
    setLoading(true);
    setError(null);
    try {
      const [productos, pedidos] = await Promise.all([listarCatalogo(api), listarPedidos(api)]);
      setStats({
        productos: productos.length,
        agotados: productos.filter((producto) => producto.stock === 0).length,
        pedidos: pedidos.length,
        pendientes: pedidos.filter((pedido) => pedido.estado === 'CREADO').length,
      });
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [api, authorization.loading]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <section className="page-stack dashboard-page">
      <PageHeader
        eyebrow="Administración"
        title="Panel de Administración"
        subtitle="Resumen de la operación con datos provenientes de la API."
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

      <section className="dashboard-shortcuts" aria-labelledby="admin-shortcuts-heading">
        <div className="section-heading">
          <div><p className="page-eyebrow">ACCESOS</p><h2 id="admin-shortcuts-heading">Gestión rápida</h2></div>
        </div>
        <div className="shortcut-grid">
          <Link to="/catalogo" className="shortcut-card">
            <span className="shortcut-icon"><Boxes size={20} strokeWidth={1.8} /></span>
            <span className="shortcut-copy"><strong>Gestionar catálogo</strong><small>Crear, editar y eliminar productos</small></span>
            <ArrowUpRight className="shortcut-arrow" size={17} />
          </Link>
          <Link to="/pedidos" className="shortcut-card">
            <span className="shortcut-icon"><ClipboardList size={20} strokeWidth={1.8} /></span>
            <span className="shortcut-copy"><strong>Gestionar pedidos</strong><small>Cambiar estados y dar seguimiento</small></span>
            <ArrowUpRight className="shortcut-arrow" size={17} />
          </Link>
        </div>
      </section>

      <section className="dashboard-shortcuts" aria-labelledby="admin-stats-heading">
        <div className="section-heading">
          <div><p className="page-eyebrow">INDICADORES</p><h2 id="admin-stats-heading">Estado del negocio</h2></div>
        </div>
        {error ? (
          <ErrorState message={error} onRetry={() => void cargar()} />
        ) : loading || stats === null ? (
          <LoadingState message="Consultando catálogo y pedidos…" />
        ) : (
          <div className="stat-grid">
            <div className="stat-card"><span className="stat-icon"><Boxes size={19} /></span><div><small>Productos</small><strong>{stats.productos}</strong></div></div>
            <div className="stat-card"><span className="stat-icon"><PackageOpen size={19} /></span><div><small>Sin stock</small><strong>{stats.agotados}</strong></div></div>
            <div className="stat-card"><span className="stat-icon"><ShoppingCart size={19} /></span><div><small>Pedidos totales</small><strong>{stats.pedidos}</strong></div></div>
            <div className="stat-card"><span className="stat-icon"><ClipboardList size={19} /></span><div><small>Pedidos por atender</small><strong>{stats.pendientes}</strong></div></div>
          </div>
        )}
      </section>

      {import.meta.env.DEV && (
        <section className="surface token-surface">
          <TokenInspector />
        </section>
      )}
    </section>
  );
}