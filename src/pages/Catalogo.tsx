// src/pages/Catalogo.tsx
//
// Página del catálogo de productos.
// La autorización de acceso se controla desde App.tsx mediante RequireRole.

import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useApi } from '../components/useApi';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarCatalogo,
  type Producto,
} from '../api/catalogo';
import { apiErrorMessage } from '../api/client';
import { useAuthorization } from '../components/useAuthorization';

export function Catalogo() {
  const api = useApi();
  const authorization = useAuthorization();
  const { loading: authorizationLoading, hasScope } = authorization;
  const canRead = hasScope('catalog.read');
  const isAdmin = authorization.roles.includes('Admin');
  const canWrite = isAdmin && hasScope('catalog.write');

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '' });

  const cargarCatalogo = useCallback(async () => {
    if (!api || !canRead) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listarCatalogo(api);
      setProductos(data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api, canRead]);

  useEffect(() => {
    if (authorizationLoading || !canRead || !api) return;
    const client = api;
    let active = true;

    async function load() {
      try {
        const data = await listarCatalogo(client);
        if (active) {
          setProductos(data);
          setError(null);
        }
      } catch (err) {
        if (active) setError(apiErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [api, authorizationLoading, canRead]);

  function abrirCreacion() {
    setEditingProduct(null);
    setForm({ nombre: '', descripcion: '', precio: '', stock: '' });
    setFormError(null);
    setNotice(null);
    setFormMode('create');
  }

  function abrirEdicion(producto: Producto) {
    setEditingProduct(producto);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: String(producto.precio),
      stock: String(producto.stock),
    });
    setFormError(null);
    setNotice(null);
    setFormMode('edit');
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!api || !canWrite || saving) return;

    const precio = Number(form.precio);
    const stock = Number(form.stock);
    if (!form.nombre.trim() || !form.descripcion.trim() || !Number.isFinite(precio) || precio < 0 || !Number.isInteger(stock) || stock < 0) {
      setFormError('Completa todos los campos. El precio debe ser válido y el stock un entero no negativo.');
      return;
    }

    const values = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio,
      stock,
    };
    setSaving(true);
    setFormError(null);
    setNotice(null);
    try {
      if (formMode === 'create') {
        const created = await crearProducto(api, values);
        setProductos((current) => [created, ...current]);
        setNotice('Producto creado correctamente.');
      } else if (editingProduct) {
        const updated = await actualizarProducto(api, editingProduct.id, values);
        setProductos((current) => current.map((item) =>
          item.id === editingProduct.id ? (updated ?? { ...editingProduct, ...values }) : item,
        ));
        setNotice('Producto actualizado correctamente.');
      }
      setFormMode('closed');
      setEditingProduct(null);
    } catch (err) {
      setFormError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(producto: Producto) {
    if (!api || !canWrite || deletingId !== null) return;
    if (!window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return;

    setDeletingId(producto.id);
    setActionError(null);
    setNotice(null);
    try {
      await eliminarProducto(api, producto.id);
      setProductos((current) => current.filter((item) => item.id !== producto.id));
      setNotice('Producto eliminado correctamente.');
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

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
          onClick={() => void cargarCatalogo()}
          disabled={loading || authorization.loading || !api || !canRead}
        >
          {loading ? 'Actualizando...' : 'Actualizar catálogo'}
        </button>
      </div>

      {canWrite && formMode === 'closed' && (
        <button className="btn btn-primary" onClick={abrirCreacion} disabled={saving || deletingId !== null}>
          Crear producto
        </button>
      )}

      {isAdmin && !hasScope('catalog.write') && !authorization.loading && (
        <div className="state-panel state-info" role="status">
          <p>Tu rol permite administrar el catálogo, pero falta el permiso catalog.write.</p>
        </div>
      )}

      {formMode !== 'closed' && (
        <section className="surface order-create">
          <h2>{formMode === 'create' ? 'Crear producto' : 'Editar producto'}</h2>
          <form className="order-form" onSubmit={handleSave}>
            <label>
              Nombre
              <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required maxLength={120} />
            </label>
            <label>
              Descripción
              <input value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} required maxLength={1000} />
            </label>
            <label>
              Precio
              <input type="number" min="0" step="0.01" value={form.precio} onChange={(event) => setForm({ ...form, precio: event.target.value })} required />
            </label>
            <label>
              Stock
              <input type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
            </label>
            <button className="btn btn-primary" type="submit" disabled={saving || deletingId !== null}>
              {saving ? 'Guardando...' : 'Guardar producto'}
            </button>
            <button className="btn btn-quiet" type="button" onClick={() => setFormMode('closed')} disabled={saving}>
              Cancelar
            </button>
          </form>
          {formError && <p className="form-error" role="alert">{formError}</p>}
        </section>
      )}

      {notice && <p className="form-success" role="status">{notice}</p>}
      {actionError && <div className="state-panel state-error" role="alert"><p>{actionError}</p></div>}

      {backendPendiente && (
        <div className="state-panel state-info" role="status">
          <h2>Catálogo preparado</h2>
          <p>El catálogo está preparado, pero el backend todavía no ha sido configurado.</p>
        </div>
      )}

      {!backendPendiente && !authorization.loading && authorization.error && (
        <div className="state-panel state-error" role="alert"><p>{authorization.error}</p></div>
      )}

      {!backendPendiente && !authorization.loading && !authorization.error && !canRead && (
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

      {!error && loading && !authorization.loading && canRead && (
        <div className="state-panel" role="status">
          <span className="loading-indicator" aria-hidden="true" />
          <p>Cargando productos...</p>
        </div>
      )}

      {!error && !backendPendiente &&
        !loading &&
        !authorization.loading && canRead &&
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
        !authorization.loading && canRead &&
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

                {canWrite && (
                  <div className="order-actions" aria-label={`Acciones para ${producto.nombre}`}>
                    <button className="btn btn-secondary" onClick={() => abrirEdicion(producto)} disabled={saving || deletingId !== null}>
                      Editar
                    </button>
                    <button className="btn btn-quiet" onClick={() => void handleDelete(producto)} disabled={saving || deletingId !== null}>
                      {deletingId === producto.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
    </section>
  );
}