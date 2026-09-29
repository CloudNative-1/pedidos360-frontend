// src/pages/Pedidos.tsx
//
// Página principal de gestión de pedidos.
// La autenticación y autorización de acceso se controlan
// desde App.tsx mediante RequireAuth y RequireRole.

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';

import { useApi } from '../components/useApi';
import { useAuthorization } from '../components/useAuthorization';
import { listarCatalogo, type Producto } from '../api/catalogo';

import {
  actualizarEstadoPedido,
  crearPedido,
  listarPedidos,
  type Pedido,
  type EstadoPedido,
} from '../api/pedidos';

import { apiErrorMessage } from '../api/client';
import { PageHeader } from '../components/layout/PageHeader';
import { PedidoCard } from '../components/pedidos/PedidoCard';
import { PedidoForm } from '../components/pedidos/PedidoForm';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';

export function Pedidos() {
  const api = useApi();
  const authorization = useAuthorization();
  const { loading: authorizationLoading, hasScope } = authorization;

  const [pedidos, setPedidos] =
    useState<Pedido[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const cargarPedidos = useCallback(async () => {
    if (!api || authorizationLoading || !hasScope('orders.read')) return;
    try {
      const data = await listarPedidos(api);
      setPedidos(data);
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api, authorizationLoading, hasScope]);

  useEffect(() => {
    if (!api || authorizationLoading || !hasScope('orders.read')) return;
    let active = true;

    void listarPedidos(api)
      .then((data) => {
        if (active) {
          setPedidos(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [api, authorizationLoading, hasScope]);

  const actualizar = () => {
    setLoading(true);
    setError(null);
    void cargarPedidos();
  };

  const roles = authorization.roles;
  const puedeCrear =
    (roles.includes('Cliente') || roles.includes('Operador')) &&
    authorization.hasScope('orders.write');
  const puedeCambiarEstado =
    (roles.includes('Admin') || roles.includes('Operador')) &&
    authorization.hasScope('orders.write');
  const backendPendiente = error === 'El backend aún no está configurado.';
  const canReadCatalog = authorization.hasScope('catalog.read');

  useEffect(() => {
    if (!api || !puedeCrear || !canReadCatalog) return;
    let active = true;
    void listarCatalogo(api)
      .then((data) => {
        if (active) {
          setProductos(data);
          setProductError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) setProductError(apiErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });
    return () => {
      active = false;
    };
  }, [api, canReadCatalog, puedeCrear]);

  useEffect(() => {
    if (window.location.hash === '#nuevo-pedido') {
      document.getElementById('nuevo-pedido')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!api || !productoId.trim() || !Number.isInteger(cantidad) || cantidad < 1) {
      setFormError('Indica un producto y una cantidad entera mayor que cero.');
      return;
    }

    setCreating(true);
    setFormError(null);
    setNotice(null);
    try {
      const pedido = await crearPedido(api, {
        productos: [{ productoId: productoId.trim(), cantidad }],
      });
      setPedidos((current) => [pedido, ...current]);
      setProductoId('');
      setCantidad(1);
      setNotice('El pedido fue enviado.');
    } catch (err) {
      setFormError(apiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleTransition(pedido: Pedido, estado: EstadoPedido) {
    if (!api || pendingId !== null || creating) return;
    setPendingId(pedido.id);
    setActionError(null);
    setNotice(null);
    try {
      const updated = await actualizarEstadoPedido(api, pedido.id, estado);
      setPedidos((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`Pedido #${pedido.id}: ${formatearEstado(estado)}.`);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  const canRead = authorization.hasScope('orders.read');

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Operación"
        title="Pedidos"
        subtitle="Consulta, crea y da seguimiento a los pedidos."
        actions={<button className="secondary-button" onClick={actualizar} disabled={loading || authorization.loading || !api || !canRead}>
          <RefreshCw size={16} />Actualizar
        </button>}
      />

      {notice && <p className="form-success" role="status">{notice}</p>}

      {backendPendiente && (
        <div className="state-panel state-info" role="status">
          <h2>Pedidos preparados</h2>
          <p>La consulta y gestión de pedidos estarán disponibles cuando se configure el backend.</p>
        </div>
      )}

      {!backendPendiente && !authorization.loading && authorization.error && (
        <div className="state-panel state-error" role="alert"><p>{authorization.error}</p></div>
      )}

      {!backendPendiente && !authorization.loading && !authorization.error && !canRead && (
        <div className="state-panel state-error" role="alert">
          <h2>Permiso de consulta no disponible</h2>
          <p>Tu cuenta no tiene el permiso necesario para consultar pedidos.</p>
        </div>
      )}

      {canRead && !backendPendiente && !authorization.loading && !authorization.error && (
        <>
          {puedeCrear && (
            <PedidoForm
              productoId={productoId}
              cantidad={cantidad}
              products={productos}
              productsLoading={loadingProducts && canReadCatalog}
              submitting={creating || pendingId !== null}
              error={formError ?? productError}
              onProductChange={setProductoId}
              onQuantityChange={setCantidad}
              onSubmit={handleCreate}
            />
          )}

          {authorization.hasScope('orders.write') && !puedeCrear && !puedeCambiarEstado && (
            <p className="security-note">Las operaciones disponibles dependen del rol y los permisos de tu cuenta.</p>
          )}
        </>
      )}

      {error && !backendPendiente && <ErrorState message={error} onRetry={actualizar} />}
      {actionError && <ErrorState title="No se pudo actualizar el pedido" message={actionError} />}

      {!error && loading && !backendPendiente && !authorization.loading && canRead && <LoadingState message="Cargando pedidos…" />}

      {!error && !backendPendiente && !authorization.loading && canRead &&
        !loading &&
        pedidos.length === 0 && <EmptyState title="No hay pedidos disponibles" description="Los pedidos asociados a tu cuenta aparecerán aquí." />}

      {!error && !backendPendiente && !authorization.loading && canRead &&
        !loading &&
        pedidos.length > 0 && (
          <>
          <div className="orders-list">
            {pedidos.map((pedido) => <PedidoCard
              key={pedido.id}
              pedido={pedido}
              canChangeStatus={puedeCambiarEstado}
              pending={pendingId !== null || creating}
              saving={pendingId === pedido.id}
              onTransition={(order, state) => void handleTransition(order, state)}
            />)}
          </div>
          </>
        )}
    </section>
  );
}

function formatearEstado(
  estado: EstadoPedido,
) {
  switch (estado) {
    case 'CREADO':
      return 'Creado';

    case 'ACEPTADO':
      return 'Aceptado';

    case 'EN_PREPARACION':
      return 'En preparación';

    case 'DESPACHADO':
      return 'Despachado';

    case 'ENTREGADO':
      return 'Entregado';

    case 'CANCELADO':
      return 'Cancelado';

    default:
      return estado;
  }
}
