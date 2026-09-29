import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, busy = false, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onKeyDown={(event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    }}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <span className="confirm-icon"><AlertTriangle size={22} /></span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="dialog-actions">
          <button className="secondary-button" onClick={onCancel} disabled={busy} autoFocus>Volver</button>
          <button className="danger-button" onClick={onConfirm} disabled={busy}>{busy ? 'Eliminando…' : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}