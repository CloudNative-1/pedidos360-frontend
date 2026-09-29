// src/pages/Landing.tsx
// Página PÚBLICA (no está detrás de RequireAuth). Solo ofrece login/logout;
// el contenido protegido vive detrás del guard y /inicio resuelve el panel
// según el rol.
import { useState } from 'react';
import { ArrowRight, Boxes, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../auth/authConfig';

import brandMark from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_20.png';
import castMain from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_42.png';
import castLeft from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_04_04.png';
import castRight from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_08_06.png';

function MicrosoftLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f35325" />
      <rect x="11" y="1" width="9" height="9" fill="#81bc06" />
      <rect x="1" y="11" width="9" height="9" fill="#05a6f0" />
      <rect x="11" y="11" width="9" height="9" fill="#ffba08" />
    </svg>
  );
}

function WelcomeArt() {
  return (
    <div className="welcome-art" aria-hidden="true">
      <div className="welcome-scene">
        <img className="welcome-scene-main" src={castMain} alt="" />
        <img className="welcome-scene-side left" src={castLeft} alt="" />
        <img className="welcome-scene-side right" src={castRight} alt="" />
      </div>
      <div className="welcome-art-chip"><Boxes size={17} /> Catálogo y pedidos</div>
      <div className="welcome-art-shield"><ShieldCheck size={20} /></div>
    </div>
  );
}

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
        <div className="welcome-topbar"><img className="welcome-brand-mark" src={brandMark} alt="" /><strong>Pedidos360</strong></div>
        <section className="welcome-layout">
          <div className="welcome-copy">
            <p className="welcome-kicker">SISTEMA DE PEDIDOS</p>
            <h1>Tu operación,<br /><span>en movimiento.</span></h1>
            <p className="welcome-description">Catálogo y pedidos, organizados en un mismo lugar para que cada etapa avance con claridad.</p>
            <Link className="welcome-button" to="/inicio">Continuar al panel<ArrowRight size={17} /></Link>
            <button className="welcome-secondary-button" onClick={handleLogin} disabled={inProgress !== InteractionStatus.None}>
              Cambiar cuenta
            </button>
          </div>
          <WelcomeArt />
        </section>
        <footer className="welcome-footer">
          <span>Acceso seguro con Microsoft Entra ID</span>
          <Link className="welcome-demo-link" to="/catalogo-demo">Ver mini catálogo →</Link>
        </footer>
      </main>
    );
  }

  return (
    <main className="welcome-screen">
      <div className="welcome-topbar"><img className="welcome-brand-mark" src={brandMark} alt="" /><strong>Pedidos360</strong></div>
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
            {inProgress === InteractionStatus.None && <MicrosoftLogo />}
            {inProgress !== InteractionStatus.None ? 'Conectando…' : 'Ingresar con Microsoft'}
            <ArrowRight size={17} />
          </button>
          <button
            className="welcome-secondary-button"
            onClick={handleLogin}
            disabled={inProgress !== InteractionStatus.None}
          >
            Ingresar con otra cuenta
          </button>
          <p className="welcome-security"><ShieldCheck size={15} /> Inicio de sesión seguro con Microsoft Entra ID</p>
          {error && <p className="inline-error" role="alert">{error}</p>}
        </div>
        <WelcomeArt />
      </section>
      <footer className="welcome-footer">
          <span>Acceso seguro con Microsoft Entra ID</span>
          <Link className="welcome-demo-link" to="/catalogo-demo">Ver mini catálogo →</Link>
        </footer>
    </main>
  );
}