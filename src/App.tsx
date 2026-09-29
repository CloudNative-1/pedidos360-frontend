// src/App.tsx
//
// Configuración principal de navegación y rutas de Pedidos360.
//
// RequireAuth:
// - Comprueba que exista una sesión iniciada.
//
// RequireRole:
// - Comprueba que el usuario tenga al menos uno de los roles
//   permitidos para acceder a una ruta.
//
// Las rutas utilizan nombres en español para mantener
// consistencia dentro del proyecto.

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';
import { RequireAuth } from './auth/RequireAuth';
import { RequireRole } from './auth/RequireRole';
import { AppShell } from './components/layout/AppShell';
import { Landing } from './pages/Landing';
import { CatalogoDemo } from './pages/CatalogoDemo';
import { Dashboard } from './pages/Dashboard';
import { Catalogo } from './pages/Catalogo';
import { Pedidos } from './pages/Pedidos';
import { Perfil } from './pages/Perfil';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.getElementById('main-content')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/catalogo-demo" element={<CatalogoDemo />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route element={<RequireRole roles={['Admin', 'Operador']} />}>
              <Route path="/catalogo" element={<Catalogo />} />
            </Route>
            <Route element={<RequireRole roles={['Admin', 'Operador', 'Cliente']} />}>
              <Route path="/pedidos" element={<Pedidos />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}