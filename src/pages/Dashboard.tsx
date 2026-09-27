// src/Dashboard.tsx
// Vista PROTEGIDA: solo se renderiza dentro del guard <RequireAuth/> (ver
// App.tsx) — este componente asume que ya hay sesión activa.
import { useMsal } from '@azure/msal-react';
import { TokenInspector } from '../components/TokenInspector';
import { Catalogo } from '../pages/Catalogo';

export function Dashboard() {
  const { accounts } = useMsal();
  const currentUser = accounts[0];

  return (
    <div className="card">
      <div className="avatar">
        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
      </div>
      <h2>¡Bienvenido, {currentUser?.name || 'Usuario'}!</h2>
      <p className="subtitle">Autenticado con Microsoft Entra ID</p>

      <div className="user-details">
        <div className="detail-item">
          <strong>Correo / Usuario:</strong>
          <span>{currentUser?.username}</span>
        </div>
        <div className="detail-item">
          <strong>Tenant ID:</strong>
          <code>{currentUser?.tenantId}</code>
        </div>
      </div>

      {/* Integración con el backend protegido (API Gateway + JWT authorizer) */}
      <hr style={{ margin: '1.5rem 0', borderColor: '#eee' }} />
      <TokenInspector />
      <hr style={{ margin: '1.5rem 0', borderColor: '#eee' }} />
      <Catalogo />
    </div>
  );
}
