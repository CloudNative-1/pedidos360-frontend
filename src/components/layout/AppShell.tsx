import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useAuthorization } from '../useAuthorization';
import { Sidebar } from './Sidebar';
import { resolveActiveAccount } from '../../auth/activeAccount';
import { rutaInicioPorRol } from '../../utils/rolInicio';

const routeTitles: Record<string, string> = {
  '/inicio': 'Inicio',
  '/admin': 'Panel de Administración',
  '/operador': 'Panel de Operaciones',
  '/cliente': 'Inicio',
  '/comprar': 'Comprar',
  '/catalogo': 'Catálogo',
  '/pedidos': 'Pedidos',
  '/perfil': 'Mi perfil',
};

export function AppShell() {
  const { instance, accounts, inProgress } = useMsal();
  const authorization = useAuthorization();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const account = resolveActiveAccount(instance, accounts);
  const userName = account?.name ?? account?.username ?? 'Cuenta Microsoft';
  const canSeeCatalog = authorization.roles.some((role) => role === 'Admin' || role === 'Operador');
  const canSeeOrders = authorization.roles.some((role) => ['Admin', 'Operador', 'Cliente'].includes(role));
  const homePath = rutaInicioPorRol(authorization.roles);

  function logout() {
    if (inProgress === InteractionStatus.None) {
      void instance.logoutRedirect({
        account,
        postLogoutRedirectUri: window.location.origin,
      }).catch(() => {
        console.error('No se pudo cerrar la sesión con Microsoft.');
      });
    }
  }

  function changeAccount() {
    if (inProgress === InteractionStatus.None) {
      // "Cambiar cuenta" cierra la sesión de Microsoft antes de volver al
      // ingreso. Es el paso que faltaba: mientras la cookie de SSO siga
      // viva, Microsoft revalida en silencio la MISMA cuenta en el
      // redirect y el selector nunca llega a aparecer, por lo que se
      // volvía al mismo paso sin cambiar la identidad. Al volver, la
      // pantalla de ingreso ofrece "Ingresar con otra cuenta", que sí
      // abre el selector y deja que la cuenta elegida sea la activa.
      instance.setActiveAccount(null);
      void instance
        .logoutRedirect({
          account,
          postLogoutRedirectUri: `${window.location.origin}/?cambiarCuenta=1`,
        })
        .catch(() => {
          console.error('No se pudo cambiar la cuenta de Microsoft.');
        });
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        userName={userName}
        username={account?.username ?? ''}
        roles={authorization.roles}
        homePath={homePath}
        canSeeCatalog={canSeeCatalog}
        canSeeOrders={canSeeOrders}
        open={menuOpen}
        logout={logout}
        changeAccount={changeAccount}
        logoutDisabled={inProgress !== InteractionStatus.None}
        onNavigate={() => setMenuOpen(false)}
      />
      {menuOpen && <button className="sidebar-scrim" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
      <div className="app-main">
        <header className="mobile-header">
          <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="primary-sidebar" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span>Pedidos360</span>
          <span className="mobile-route-title">{routeTitles[location.pathname]}</span>
        </header>
        <main className="page-content" id="main-content" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}