import { ArrowRight, CalendarDays, Package2 } from 'lucide-react';
import type { EstadoPedido, Pedido } from '../../api/pedidos';
import { transicionesPermitidas } from '../../api/pedidos';
import { PedidoEstado } from './PedidoEstado';

interface PedidoCardProps {
  pedido: Pedido;
  canChangeStatus: boolean;
  pending: boolean;
  saving: boolean;
  onTransition: (pedido: Pedido, estado: EstadoPedido) => void;
}

export function PedidoCard({ pedido, canChangeStatus, pending, saving, onTransition }: PedidoCardProps) {
  const date = new Date(pedido.fechaCreacion);
  const dateLabel = Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  const total = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(pedido.total);

  return (
    <article className="order-card">
      <header className="order-card-header">
        <div>
          <p className="card-overline">Pedido</p>
          <h2>#{pedido.id}</h2>
        </div>
        <PedidoEstado estado={pedido.estado} />
      </header>
      <div className="order-meta">
        <span><CalendarDays size={15} />{dateLabel}</span>
        <span><strong>Cliente</strong>{pedido.clienteNombre || pedido.clienteId}</span>
      </div>
      <div className="order-items">
        <p className="order-section-label"><Package2 size={15} /> Productos</p>
        {pedido.productos.map((product, index) => (
          <div className="order-item" key={`${product.productoId}-${index}`}>
            <span>{product.nombre ?? `Producto ${product.productoId}`}</span>
            <span>{product.cantidad} un.</span>
          </div>
        ))}
      </div>
      <footer className="order-card-footer">
        <span>Total</span><strong>{total}</strong>
      </footer>
      {canChangeStatus && transicionesPermitidas(pedido.estado).length > 0 && (
        <div className="order-transitions" aria-label={`Acciones para el pedido ${pedido.id}`}>
          {transicionesPermitidas(pedido.estado).map((estado) => (
            <button
              className={estado === 'CANCELADO' ? 'text-button danger-text' : 'transition-button'}
              key={estado}
              onClick={() => onTransition(pedido, estado)}
              disabled={pending}
            >
              {saving ? 'Guardando…' : etiquetaAccion(estado)}
              {estado !== 'CANCELADO' && <ArrowRight size={14} />}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

function etiquetaAccion(estado: EstadoPedido): string {
  switch (estado) {
    case 'ACEPTADO': return 'Aceptar';
    case 'CANCELADO': return 'Cancelar';
    case 'EN_PREPARACION': return 'En preparación';
    case 'DESPACHADO': return 'Despachar';
    case 'ENTREGADO': return 'Entregar';
    case 'CREADO': return 'Creado';
  }
}