// src/pages/Catalogo.tsx
//
// Página del catálogo de productos.
// La autorización de acceso se controla desde App.tsx mediante RequireRole.

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useApi } from '../components/useApi';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarCatalogo,
  type Producto,
} from '../api/catalogo';
import { ApiError, apiErrorDetails, apiErrorMessage } from '../api/client';
import { useAuthorization } from '../components/useAuthorization';
import { PageHeader } from '../components/layout/PageHeader';
import { ProductoCard } from '../components/catalogo/ProductoCard';
import { ProductoForm, type ProductoFormValues } from '../components/catalogo/ProductoForm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';

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
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoFormValues>({ nombre: '', descripcion: '', precio: '', stock: '' });

  const cargarCatalogo = useCallback(async () => {
    if (!api || !canRead) return;
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    try {
      const data = await listarCatalogo(api);
      setProductos(data);
    } catch (err) {
      setError(apiErrorMessage(err));
      setErrorDetails(err instanceof ApiError && err.status === 403 ? apiErrorDetails(err) : null);
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
          setErrorDetails(null);
        }
      } catch (err) {
        if (active) {
          setError(apiErrorMessage(err));
          setErrorDetails(err instanceof ApiError && err.status === 403 ? apiErrorDetails(err) : null);
        }
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
      setConfirmingDelete(null);
    }
  }

  const backendPendiente = error === 'El backend aún no está configurado.';

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Inventario"
        title="Catálogo"
        subtitle="Gestiona los productos y su disponibilidad."
        actions={(
          <>
            <button className="secondary-button" onClick={() => void cargarCatalogo()} disabled={loading || !api || !canRead}>
              <RefreshCw size={16} />Actualizar
            </button>
            {canWrite && <button className="primary-button" onClick={abrirCreacion} disabled={saving || deletingId !== null}>
              <Plus size={17} />Nuevo producto
            </button>}
          </>
        )}
      />
      {authorization.error && <ErrorState message={authorization.error} />}
      {isAdmin && !hasScope('catalog.write') && !authorization.loading && (
        <p className="permission-note">Tu rol permite administrar el catálogo, pero tu sesión no incluye catalog.write.</p>
      )}
      {notice && <p className="success-banner" role="status">{notice}</p>}
      {actionError && <ErrorState title="No se pudo eliminar el producto" message={actionError} />}
      {error && !backendPendiente && <ErrorState title={error.startsWith('Tu cuenta') ? 'La API rechazó la solicitud' : undefined} message={error} details={errorDetails} onRetry={() => void cargarCatalogo()} />}
      {backendPendiente && <ErrorState message={error ?? 'El backend no está configurado.'} />}
      {loading && canRead && <LoadingState message="Cargando productos…" />}
      {!loading && !error && canRead && productos.length === 0 && (
        <EmptyState title="No hay productos registrados" description="Cuando existan productos, aparecerán aquí." />
      )}
      {!loading && !error && canRead && productos.length > 0 && (
        <div className="product-grid">
          {productos.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              canWrite={canWrite}
              deleting={deletingId === producto.id}
              onEdit={abrirEdicion}
              onDelete={setConfirmingDelete}
            />
          ))}
        </div>
      )}
      {formMode !== 'closed' && (
        <ProductoForm
          mode={formMode}
          values={form}
          saving={saving}
          error={formError}
          onChange={setForm}
          onSubmit={handleSave}
          onClose={() => setFormMode('closed')}
        />
      )}
      {confirmingDelete && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Seguro que quieres eliminar “${confirmingDelete.nombre}”? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar producto"
          busy={deletingId === confirmingDelete.id}
          onConfirm={() => void handleDelete(confirmingDelete)}
          onCancel={() => setConfirmingDelete(null)}
        />
      )}
    </section>
  );
}