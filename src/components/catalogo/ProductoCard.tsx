import { Pencil, Trash2 } from 'lucide-react';
import type { Producto } from '../../api/catalogo';

interface ProductoCardProps {
  producto: Producto;
  canWrite: boolean;
  deleting: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
}

export function ProductoCard({ producto, canWrite, deleting, onEdit, onDelete }: ProductoCardProps) {
  const price = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(producto.precio);

  return (
    <article className="product-card">
      <div className="product-card-heading">
        <div>
          <p className="card-overline">Producto</p>
          <h2>{producto.nombre}</h2>
        </div>
        <span className={`stock-badge${producto.stock === 0 ? ' is-empty' : ''}`}>
          {producto.stock} en stock
        </span>
      </div>
      <p className="product-description">{producto.descripcion}</p>
      <div className="product-card-footer">
        <strong className="product-price">{price}</strong>
        {canWrite && (
          <div className="card-actions">
            <button className="icon-button" onClick={() => onEdit(producto)} aria-label={`Editar ${producto.nombre}`} disabled={deleting}>
              <Pencil size={16} />
            </button>
            <button className="icon-button danger-action" onClick={() => onDelete(producto)} aria-label={`Eliminar ${producto.nombre}`} disabled={deleting}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      {deleting && <span className="card-pending" role="status">Eliminando…</span>}
    </article>
  );
}