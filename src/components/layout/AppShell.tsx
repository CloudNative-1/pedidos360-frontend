import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useAuthorization } from '../useAuthorization';
import { Sidebar } from './Sidebar';
import { resolveActiveAccount } from '../../auth/activeAccount';
import { loginRequest } from '../../auth/authConfig';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Inicio',
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
      void instance.loginRedirect({ ...loginRequest, prompt: 'select_account' }).catch(() => {
        console.error('No se pudo abrir el selector de cuentas de Microsoft.');
      });
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        userName={userName}
        username={account?.username ?? ''}
        roles={authorization.roles}
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