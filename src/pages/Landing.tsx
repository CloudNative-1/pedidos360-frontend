// src/Landing.tsx
// Página PÚBLICA (no está detrás de RequireAuth). Solo ofrece login/logout;
// el contenido protegido vive en /dashboard, detrás del guard.
import { Link } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../auth/authConfig';

export function Landing() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    if (inProgress === InteractionStatus.None) {
      instance.loginRedirect(loginRequest).catch((e) => console.error(e));
    }
  };

  if (isAuthenticated) {
    return (
      <div className="card text-center">
        <h2>Ya iniciaste sesión</h2>
        <p className="subtitle">
          Ve al Dashboard para consumir el backend protegido.
        </p>
        <Link className="btn btn-login btn-lg" to="/dashboard">
          Ir al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="card text-center">
      <h2>Acceso Requerido</h2>
      <p className="subtitle">
        Para ingresar al sistema debes validar tus credenciales corporativas o
        institucionales.
      </p>
      <button
        className="btn btn-login btn-lg"
        onClick={handleLogin}
        disabled={inProgress !== InteractionStatus.None}
      >
        {inProgress !== InteractionStatus.None
          ? 'Cargando...'
          : 'Iniciar Sesión con Microsoft'}
      </button>
    </div>
  );
}
