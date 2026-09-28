// src/Landing.tsx
// Página PÚBLICA (no está detrás de RequireAuth). Solo ofrece login/logout;
// el contenido protegido vive en /dashboard, detrás del guard.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../auth/authConfig';

export function Landing() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (inProgress === InteractionStatus.None) {
      setError(null);
      instance.loginRedirect(loginRequest).catch(() => {
        setError('No se pudo iniciar sesión. Inténtalo nuevamente.');
      });
    }
  };

  if (isAuthenticated) {
    return (
      <section className="landing-panel">
        <p className="eyebrow">Pedidos360</p>
        <h1>Ya iniciaste sesión</h1>
        <p className="subtitle">Tu espacio de trabajo está listo.</p>
        <Link className="btn btn-primary btn-lg" to="/dashboard">
          Ir al Dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="landing-panel">
      <p className="eyebrow">Gestión de catálogo y pedidos</p>
      <h1>Pedidos360</h1>
      <p className="subtitle">
        Ingresa con tu cuenta de Microsoft Entra ID para continuar.
      </p>
      <button
        className="btn btn-primary btn-lg"
        onClick={handleLogin}
        disabled={inProgress !== InteractionStatus.None}
      >
        {inProgress !== InteractionStatus.None
          ? 'Conectando...'
          : 'Iniciar sesión con Microsoft'}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  );
}
