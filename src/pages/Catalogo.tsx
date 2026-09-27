import { useState } from 'react';
import { useApi } from '../components/useApi';
import { listarCatalogo, type Producto } from '../api/catalogo';
import { ApiError } from '../api/client';

export function Catalogo() {
  const api = useApi();

  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarCatalogo = async () => {
    if (!api) {
      setError('No hay sesión activa.');
      return;
    }

    setLoading(true);
    setError(null);
    setProductos(null);

    try {
      const data = await listarCatalogo(api);
      setProductos(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          `API ${err.status} ${err.statusText} — ${JSON.stringify(err.body)}`
        );
      } else {
        setError(
          err instanceof Error ? err.message : 'Error desconocido'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
      <h3>Catálogo de productos</h3>

      <p
        style={{
          fontSize: '0.85rem',
          color: '#666',
          marginBottom: '1rem',
        }}
      >
        Consulta protegida al catálogo de Pedidos360 mediante API Gateway.
      </p>

      <button
        className="btn btn-login"
        onClick={cargarCatalogo}
        disabled={loading}
      >
        {loading ? 'Consultando...' : 'Cargar catálogo'}
      </button>

      {error && (
        <p
          style={{
            color: '#d9534f',
            marginTop: '1rem',
            wordBreak: 'break-word',
          }}
        >
          {error}
        </p>
      )}

      {productos && productos.length === 0 && (
        <p style={{ marginTop: '1rem' }}>
          No hay productos disponibles.
        </p>
      )}

      {productos && productos.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {productos.map((producto, index) => (
            <div
              key={String(producto.id ?? index)}
              className="card"
              style={{ marginBottom: '1rem' }}
            >
              <h4>{producto.nombre ?? 'Producto sin nombre'}</h4>

              {producto.descripcion && (
                <p>{producto.descripcion}</p>
              )}

              {producto.precio !== undefined && (
                <p>
                  Precio: ${producto.precio}
                </p>
              )}

              {producto.stock !== undefined && (
                <p>
                  Stock: {producto.stock}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}