// src/Landing.tsx
// Página PÚBLICA (no está detrás de RequireAuth). Solo ofrece login/logout;
// el contenido protegido vive en /dashboard, detrás del guard.
import { useState } from 'react';
import { ArrowRight, Boxes, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../auth/authConfig';

export function Landing() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [error, setError] = useState<string | null>(null);
  const accountRequest = { ...loginRequest, prompt: 'select_account' as const };

  const handleLogin = () => {
    if (inProgress === InteractionStatus.None) {
      setError(null);
      instance.loginRedirect(accountRequest).catch(() => {
        setError('No se pudo iniciar sesión. Inténtalo nuevamente.');
      });
    }
  };

  if (isAuthenticated) {
    return (
      <main className="welcome-screen">
        <div className="welcome-topbar"><span className="welcome-logo-mark">P</span><strong>Pedidos360</strong></div>
        <section className="welcome-layout">
          <div className="welcome-copy">
            <p className="welcome-kicker">SISTEMA DE PEDIDOS</p>
            <h1>Tu operación,<br /><span>en movimiento.</span></h1>
            <p className="welcome-description">Catálogo y pedidos, organizados en un mismo lugar para que cada etapa avance con claridad.</p>
            <Link className="welcome-button" to="/dashboard">Continuar al panel<ArrowRight size={17} /></Link>
            <button className="welcome-secondary-button" onClick={handleLogin} disabled={inProgress !== InteractionStatus.None}>
              Cambiar cuenta
            </button>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="welcome-art-card"><span className="art-icon"><ClipboardCheck size={24} /></span><strong>Operación coordinada</strong><span>Pedidos360</span></div>
            <div className="welcome-art-chip"><Boxes size={17} /> Catálogo y pedidos</div>
            <div className="welcome-art-shield"><ShieldCheck size={20} /></div>
          </div>
        </section>
        <footer className="welcome-footer">Acceso seguro con Microsoft Entra ID</footer>
      </main>
    );
  }

  return (
    <main className="welcome-screen">
      <div className="welcome-topbar"><span className="welcome-logo-mark">P</span><strong>Pedidos360</strong></div>
      <section className="welcome-layout">
        <div className="welcome-copy">
          <p className="welcome-kicker">SISTEMA DE PEDIDOS</p>
          <h1>Tu operación,<br /><span>en movimiento.</span></h1>
          <p className="welcome-description">Gestiona el catálogo y acompaña cada pedido desde su creación hasta la entrega.</p>
          <button
            className="welcome-button"
            onClick={handleLogin}
            disabled={inProgress !== InteractionStatus.None}
          >
            {inProgress !== InteractionStatus.None ? 'Conectando…' : 'Iniciar sesión con Microsoft'}
            <ArrowRight size={17} />
          </button>
          <p className="welcome-security"><ShieldCheck size={15} /> Inicio de sesión seguro con Microsoft Entra ID</p>
          {error && <p className="inline-error" role="alert">{error}</p>}
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-art-card"><span className="art-icon"><ClipboardCheck size={24} /></span><strong>Operación coordinada</strong><span>Pedidos360</span></div>
          <div className="welcome-art-chip"><Boxes size={17} /> Catálogo y pedidos</div>
          <div className="welcome-art-shield"><ShieldCheck size={20} /></div>
        </div>
      </section>
      <footer className="welcome-footer">Acceso seguro con Microsoft Entra ID</footer>
    </main>
  );
}
