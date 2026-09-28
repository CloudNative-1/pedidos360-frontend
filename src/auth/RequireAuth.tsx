import { Outlet } from 'react-router-dom';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { loginRequest } from './authConfig';

export function RequireAuth() {
  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={loginRequest}
      loadingComponent={() => (
        <div className="state-panel" role="status">
          <span className="loading-indicator" aria-hidden="true" />
          <p>Comprobando tu sesión...</p>
        </div>
      )}
      errorComponent={() => (
        <div className="state-panel state-error" role="alert">
          <h2>No se pudo iniciar sesión</h2>
          <p>Comprueba tu conexión e inténtalo de nuevo.</p>
        </div>
      )}
    >
      <Outlet />
    </MsalAuthenticationTemplate>
  );
}
