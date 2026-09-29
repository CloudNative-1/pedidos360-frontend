// src/pages/Inicio.tsx
//
// Página privada que resuelve el panel de inicio según el rol
// de la cuenta activa: Admin → /admin, Operador → /operador,
// Cliente → /cliente. Es el destino de "Continuar al panel".
import { Navigate } from 'react-router-dom';

import { useAuthorization } from '../components/useAuthorization';
import { rutaInicioPorRol } from '../utils/rolInicio';

export function Inicio() {
  const authorization = useAuthorization();

  if (authorization.loading) {
    return (
      <div className="state-panel" role="status">
        <h3>Preparando tu espacio</h3>
        <p className="subtitle">Estamos verificando el rol de tu cuenta para mostrarte el panel correspondiente.</p>
      </div>
    );
  }

  return <Navigate to={rutaInicioPorRol(authorization.roles)} replace />;
}