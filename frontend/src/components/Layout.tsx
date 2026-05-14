import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/products", label: "Productos", icon: "📦" },
  { path: "/movements", label: "Movimientos", icon: "🔄" },
  { path: "/alerts", label: "Alertas", icon: "⚠️" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, company, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">InventarioPYME</h1>
            {company && (
              <span className="text-primary-200 text-sm hidden sm:inline">
                | {company.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-200 hidden sm:inline">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="bg-primary-800 hover:bg-primary-900 px-3 py-1 rounded text-sm transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4">
          <ul className="flex gap-1 -mb-px">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`inline-flex items-center gap-1 px-4 py-2 text-sm rounded-t-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-white text-primary-700 font-semibold"
                      : "text-primary-200 hover:text-white hover:bg-primary-600"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
