import type { EstadoPedido } from '../../api/pedidos';
import { StatusBadge } from '../common/StatusBadge';

const labels: Record<EstadoPedido, string> = {
  CREADO: 'Creado',
  ACEPTADO: 'Aceptado',
  EN_PREPARACION: 'En preparación',
  DESPACHADO: 'Despachado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export function PedidoEstado({ estado }: { estado: EstadoPedido }) {
  return <StatusBadge value={estado} label={labels[estado]} />;
}