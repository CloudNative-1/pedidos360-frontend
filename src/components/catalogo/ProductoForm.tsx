import { X } from 'lucide-react';
import type { FormEvent } from 'react';

export interface ProductoFormValues {
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
}

interface ProductoFormProps {
  mode: 'create' | 'edit';
  values: ProductoFormValues;
  saving: boolean;
  error: string | null;
  onChange: (values: ProductoFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function ProductoForm({ mode, values, saving, error, onChange, onSubmit, onClose }: ProductoFormProps) {
  function update(field: keyof ProductoFormValues, value: string) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="dialog-backdrop" role="presentation" onKeyDown={(event) => {
      if (event.key === 'Escape' && !saving) onClose();
    }}>
      <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="producto-form-title">
        <header className="dialog-header">
          <div>
            <p className="card-overline">Catálogo</p>
            <h2 id="producto-form-title">{mode === 'create' ? 'Nuevo producto' : 'Editar producto'}</h2>
          </div>
          <button className="icon-button" aria-label="Cerrar formulario" onClick={onClose} disabled={saving}><X size={18} /></button>
        </header>
        <form className="form-grid" onSubmit={onSubmit}>
          <label className="form-field">
            <span>Nombre</span>
            <input value={values.nombre} onChange={(event) => update('nombre', event.target.value)} required maxLength={120} autoFocus />
          </label>
          <label className="form-field">
            <span>Descripción</span>
            <textarea value={values.descripcion} onChange={(event) => update('descripcion', event.target.value)} required maxLength={1000} rows={3} />
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>Precio (CLP)</span>
              <input type="number" min="0" step="0.01" value={values.precio} onChange={(event) => update('precio', event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Stock</span>
              <input type="number" min="0" step="1" value={values.stock} onChange={(event) => update('stock', event.target.value)} required />
            </label>
          </div>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <footer className="dialog-actions">
            <button className="secondary-button" type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}