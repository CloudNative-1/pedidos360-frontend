import React from 'react';
import ReactDOM from 'react-dom/client';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import type { EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './auth/authConfig';
import App from './App';
import './css/index.css';

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    msalInstance.setActiveAccount(payload.account);
  }
});

async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('No se encontró el contenedor de la aplicación.');

  const root = ReactDOM.createRoot(rootElement);

  try {
    await msalInstance.initialize();

    const accounts = msalInstance.getAllAccounts();
    if (!msalInstance.getActiveAccount() && accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }

    root.render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </React.StrictMode>,
    );
  } catch {
    root.render(
      <main className="startup-error">
        <h1>Pedidos360</h1>
        <p>No se pudo iniciar la autenticación. Recarga la página o inténtalo más tarde.</p>
      </main>,
    );
  }
}

void bootstrap();
