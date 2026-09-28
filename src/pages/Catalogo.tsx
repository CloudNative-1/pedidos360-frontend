// src/pages/Catalogo.tsx
//
// Página del catálogo de productos.
// La autorización de acceso se controla desde App.tsx mediante RequireRole.

import { useCallback, useEffect, useState } from 'react';

import { useApi } from '../components/useApi';
import {
  listarCatalogo,
  type Producto,
} from '../api/catalogo';
import { apiErrorMessage } from '../api/client';
import { useAuthorization } from '../components/useAuthorization';

export function Catalogo() {
  const api = useApi();
  const authorization = useAuthorization();
  const { loading: authorizationLoading, hasScope } = authorization;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCatalogo = useCallback(async () => {
    if (!api || authorizationLoading || !hasScope('catalog.read')) return;
    try {
      const data = await listarCatalogo(api);
      setProductos(data);
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api, authorizationLoading, hasScope]);

  useEffect(() => {
    if (!api || authorizationLoading || !hasScope('catalog.read')) return;
    let active = true;

    void listarCatalogo(api)
      .then((data) => {
        if (active) {
          setProductos(data);
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
    void cargarCatalogo();
  };

  const backendPendiente = error === 'El backend aún no está configurado.';

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Catálogo</h1>

          <p className="subtitle">
            Consulta de productos y disponibilidad.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={actualizar}
          disabled={loading || authorization.loading || !api || !authorization.hasScope('catalog.read')}
        >
          {loading ? 'Actualizando...' : 'Actualizar catálogo'}
        </button>
      </div>

      {backendPendiente && (
        <div className="state-panel state-info" role="status">
          <h2>Catálogo preparado</h2>
          <p>El catálogo está preparado, pero el backend todavía no ha sido configurado.</p>
        </div>
      )}

      {!backendPendiente && !authorization.loading && authorization.error && (
        <div className="state-panel state-error" role="alert"><p>{authorization.error}</p></div>
      )}

      {!backendPendiente && !authorization.loading && !authorization.error && !authorization.hasScope('catalog.read') && (
        <div className="state-panel state-error" role="alert">
          <h2>Permiso de consulta no disponible</h2>
          <p>Tu cuenta no tiene el permiso necesario para consultar el catálogo.</p>
        </div>
      )}

      {error && (
        !backendPendiente && <div className="state-panel state-error" role="alert">
          <h3>No se pudo cargar el catálogo</h3>
          <p>{error}</p>
        </div>
      )}

      {!error && loading && !authorization.loading && authorization.hasScope('catalog.read') && (
        <div className="state-panel" role="status">
          <span className="loading-indicator" aria-hidden="true" />
          <p>Cargando productos...</p>
        </div>
      )}

      {!error && !backendPendiente &&
        !loading &&
        !authorization.loading && authorization.hasScope('catalog.read') &&
        productos.length === 0 && (
          <div className="state-panel">
            <h3>Catálogo vacío</h3>

            <p className="subtitle">
              Actualmente no existen productos registrados.
            </p>
          </div>
        )}

      {!error && !backendPendiente &&
        !loading &&
        !authorization.loading && authorization.hasScope('catalog.read') &&
        productos.length > 0 && (
          <div className="product-grid">
            {productos.map((producto) => (
              <article
                key={producto.id}
                className="surface product-card"
              >
                <div className="product-card-header">
                  <h3>{producto.nombre}</h3>

                  <span className={`stock-badge${producto.stock === 0 ? ' stock-empty' : ''}`}>
                    Stock: {producto.stock}
                  </span>
                </div>

                {producto.descripcion && (
                  <p className="subtitle">
                    {producto.descripcion}
                  </p>
                )}

                <div className="product-price">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(producto.precio)}
                </div>
              </article>
            ))}
          </div>
        )}
    </section>
  );
}