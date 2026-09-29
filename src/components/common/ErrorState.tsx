import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  title?: string;
  details?: string | null;
  onRetry?: () => void;
}

export function ErrorState({ message, title = 'No fue posible cargar la información', details, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={20} aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
        {details && <details className="api-error-details"><summary>Detalles de la respuesta</summary><pre>{details}</pre></details>}
        {onRetry && <button className="text-button" onClick={onRetry}>Reintentar</button>}
      </div>
    </div>
  );
}