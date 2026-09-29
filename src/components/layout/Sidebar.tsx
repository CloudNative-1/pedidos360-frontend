import { Boxes, ClipboardList, Home, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { SidebarUser } from './SidebarUser';

interface SidebarProps {
  userName: string;
  username: string;
  roles: string[];
  canSeeCatalog: boolean;
  canSeeOrders: boolean;
  open: boolean;
  logout: () => void;
  changeAccount: () => void;
  logoutDisabled: boolean;
  onNavigate: () => void;
}

export function Sidebar({
  userName,
  username,
  roles,
  canSeeCatalog,
  canSeeOrders,
  open,
  logout,
  changeAccount,
  logoutDisabled,
  onNavigate,
}: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-link${isActive ? ' is-active' : ''}`;

  return (
    <aside className={`sidebar${open ? ' is-open' : ''}`} id="primary-sidebar" aria-label="Navegación principal">
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">P</span>
        <span className="brand-copy">
          <strong>Pedidos360</strong>
          <small>Sistema de pedidos</small>
        </span>
      </div>
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">MENÚ</p>
        <NavLink to="/dashboard" end className={linkClass} onClick={onNavigate}>
          <Home size={18} strokeWidth={1.8} /><span>Inicio</span>
        </NavLink>
        {canSeeCatalog && (
          <NavLink to="/catalogo" className={linkClass} onClick={onNavigate}>
            <Boxes size={18} strokeWidth={1.8} /><span>Catálogo</span>
          </NavLink>
        )}
        {canSeeOrders && (
          <NavLink to="/pedidos" className={linkClass} onClick={onNavigate}>
            <ClipboardList size={18} strokeWidth={1.8} /><span>Pedidos</span>
          </NavLink>
        )}
        <NavLink to="/perfil" className={linkClass} onClick={onNavigate}>
          <UserRound size={18} strokeWidth={1.8} /><span>Mi perfil</span>
        </NavLink>
      </nav>
      <SidebarUser
        userName={userName}
        username={username}
        roles={roles}
        onLogout={logout}
        onChangeAccount={changeAccount}
        logoutDisabled={logoutDisabled}
      />
    </aside>
  );
}