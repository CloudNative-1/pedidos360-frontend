// src/pages/Pedidos.tsx
//
// Página principal de gestión de pedidos.
// La autenticación y autorización de acceso se controlan
// desde App.tsx mediante RequireAuth y RequireRole.

import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useApi } from '../components/useApi';
import { useAuthorization } from '../components/useAuthorization';

import {
  actualizarEstadoPedido,
  crearPedido,
  listarPedidos,
  type Pedido,
  type EstadoPedido,
  transicionesPermitidas,
} from '../api/pedidos';

import { apiErrorMessage } from '../api/client';

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

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!api || !productoId.trim() || cantidad < 1) return;

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
    if (!api) return;
    setPendingId(pedido.id);
    setActionError(null);
    try {
      const updated = await actualizarEstadoPedido(api, pedido.id, estado);
      setPedidos((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  const canRead = authorization.hasScope('orders.read');

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Pedidos</h1>

          <p className="subtitle">
            Consulta y seguimiento de pedidos.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={actualizar}
          disabled={loading || authorization.loading || !api || !canRead}
        >
          {loading ? 'Actualizando...' : 'Actualizar pedidos'}
        </button>
      </div>

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
            <section className="surface order-create">
              <div>
                <h2>Crear pedido</h2>
                <p className="subtitle">El cliente se identifica mediante la sesión de Microsoft Entra ID.</p>
              </div>
              <form className="order-form" onSubmit={handleCreate}>
                <label>
                  ID del producto
                  <input value={productoId} onChange={(event) => setProductoId(event.target.value)} required />
                </label>
                <label>
                  Cantidad
                  <input type="number" min="1" step="1" value={cantidad} onChange={(event) => setCantidad(Number(event.target.value))} required />
                </label>
                <button className="btn btn-primary" type="submit" disabled={creating || !productoId.trim()}>
                  {creating ? 'Enviando...' : 'Enviar pedido'}
                </button>
              </form>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              {notice && <p className="form-success" role="status">{notice}</p>}
            </section>
          )}

          {authorization.hasScope('orders.write') && !puedeCrear && !puedeCambiarEstado && (
            <p className="security-note">Las operaciones disponibles dependen del rol y los permisos de tu cuenta.</p>
          )}
        </>
      )}

      {error && (
        !backendPendiente && <div className="state-panel state-error" role="alert">
          <h3>
            No se pudo completar la solicitud
          </h3>

          <p>{error}</p>
        </div>
      )}

      {!error && loading && !backendPendiente && !authorization.loading && canRead && (
        <div className="state-panel" role="status">
          <span className="loading-indicator" aria-hidden="true" />
          <p>Cargando pedidos...</p>
        </div>
      )}

      {!error && !backendPendiente && !authorization.loading && canRead &&
        !loading &&
        pedidos.length === 0 && (
          <div className="state-panel">
            <h3>
              No existen pedidos
            </h3>

            <p className="subtitle">
              Cuando se registren pedidos
              aparecerán en esta sección.
            </p>
          </div>
        )}

      {!error && !backendPendiente && !authorization.loading && canRead &&
        !loading &&
        pedidos.length > 0 && (
          <>
          {actionError && <div className="state-panel state-error" role="alert"><p>{actionError}</p></div>}
          <div className="orders-list">
            {pedidos.map((pedido) => (
              <article
                key={pedido.id}
                className="surface order-card"
              >
                <div className="order-header">
                  <div>
                    <h3>
                      Pedido #{pedido.id}
                    </h3>

                    {(pedido.clienteNombre || pedido.clienteId) && (
                      <p className="subtitle">Cliente: {pedido.clienteNombre ?? pedido.clienteId}</p>
                    )}
                  </div>

                  <EstadoBadge
                    estado={pedido.estado}
                  />
                </div>

                {pedido.fechaCreacion && (
                  <p>
                    Fecha:{' '}
                    {formatearFecha(pedido.fechaCreacion)}
                  </p>
                )}

                {pedido.productos && (
                  <ul className="order-products">
                    {pedido.productos.map((producto, index) => (
                      <li key={`${producto.productoId}-${index}`}>
                        {producto.nombre ?? `Producto ${producto.productoId}`} · {producto.cantidad} un.
                      </li>
                    ))}
                  </ul>
                )}

                {pedido.total !==
                  undefined && (
                  <p className="order-total">
                    Total: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(pedido.total)}
                  </p>
                )}

                {puedeCambiarEstado && transicionesPermitidas(pedido.estado).length > 0 && (
                  <div className="order-actions" aria-label={`Acciones para el pedido ${pedido.id}`}>
                    {/* Esta regla también debe validarse obligatoriamente en el backend. */}
                    {transicionesPermitidas(pedido.estado).map((estado) => (
                      <button
                        className={estado === 'CANCELADO' ? 'btn btn-quiet' : 'btn btn-secondary'}
                        key={estado}
                        onClick={() => void handleTransition(pedido, estado)}
                        disabled={pendingId === pedido.id}
                      >
                        {pendingId === pedido.id ? 'Guardando...' : `Cambiar a ${formatearEstado(estado)}`}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
          </>
        )}
    </section>
  );
}

interface EstadoBadgeProps {
  estado: EstadoPedido;
}

function EstadoBadge({
  estado,
}: EstadoBadgeProps) {
  return (
    <span
      className={`order-status order-status-${estado.toLowerCase()}`}
    >
      {formatearEstado(estado)}
    </span>
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

function formatearFecha(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}