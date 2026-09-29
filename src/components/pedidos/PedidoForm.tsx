import type { FormEvent } from 'react';
import type { Producto } from '../../api/catalogo';

interface PedidoFormProps {
  productoId: string;
  cantidad: number;
  products: Producto[];
  productsLoading: boolean;
  submitting: boolean;
  error: string | null;
  onProductChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function PedidoForm({
  productoId,
  cantidad,
  products,
  productsLoading,
  submitting,
  error,
  onProductChange,
  onQuantityChange,
  onSubmit,
}: PedidoFormProps) {
  return (
    <section className="create-order-panel" id="nuevo-pedido">
      <div className="create-order-heading">
        <span className="create-order-mark">+</span>
        <div>
          <h2>Nuevo pedido</h2>
          <p>El cliente se determina desde tu sesión autenticada.</p>
        </div>
      </div>
      <form className="order-form" onSubmit={onSubmit}>
        <label className="form-field">
          <span>Producto</span>
          {products.length > 0 ? (
            <select value={productoId} onChange={(event) => onProductChange(event.target.value)} required>
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} disabled={product.stock <= 0}>
                  {product.nombre} · {product.stock} disponibles
                </option>
              ))}
            </select>
          ) : (
            <input
              value={productoId}
              onChange={(event) => onProductChange(event.target.value)}
              placeholder={productsLoading ? 'Cargando catálogo…' : 'ID del producto'}
              aria-label="ID del producto"
              required
            />
          )}
        </label>
        <label className="form-field quantity-field">
          <span>Cantidad</span>
          <input type="number" min="1" step="1" value={cantidad} onChange={(event) => onQuantityChange(Number(event.target.value))} required />
        </label>
        <button className="primary-button" type="submit" disabled={submitting || !productoId.trim()}>
          {submitting ? 'Enviando…' : 'Enviar pedido'}
        </button>
      </form>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </section>
  );
}