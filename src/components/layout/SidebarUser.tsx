import { ArrowLeftRight, LogOut } from 'lucide-react';

interface SidebarUserProps {
  userName: string;
  username: string;
  roles: string[];
  onLogout: () => void;
  onChangeAccount: () => void;
  logoutDisabled: boolean;
}

export function SidebarUser({ userName, username, roles, onLogout, onChangeAccount, logoutDisabled }: SidebarUserProps) {
  const initials = userName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

  return (
    <div className="sidebar-user">
      <div className="sidebar-account">
        <span className="user-avatar" aria-hidden="true">{initials || 'M'}</span>
        <span className="user-copy">
          <strong title={userName}>{userName}</strong>
          <small title={username}>{username || 'Sesión autenticada'}</small>
          {roles.length > 0 && <small className="user-role-label" title={roles.join(', ')}>{roles.join(' · ')}</small>}
        </span>
      </div>
      <div className="sidebar-account-actions">
        <button className="sidebar-logout" onClick={onChangeAccount} disabled={logoutDisabled}>
          <ArrowLeftRight size={17} strokeWidth={1.8} /><span>Cambiar cuenta</span>
        </button>
        <button className="sidebar-logout" onClick={onLogout} disabled={logoutDisabled}>
          <LogOut size={17} strokeWidth={1.8} /><span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}