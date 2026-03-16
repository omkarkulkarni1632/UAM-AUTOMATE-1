import { NavLink } from "react-router-dom";
import { useAuth } from "../../routing/AuthContext";
import { Roles } from "../../routing/roles";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-2 text-sm ${isActive ? "bg-slate-200" : "hover-bg-slate-100"}`;

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 border-r bg-white p-3">
      <div className="mb-4">
        <div className="text-lg font-semibold">AccessGuard</div>
        <div className="text-xs text-slate-600">{user ? user.role : "Guest"}</div>
      </div>

      <nav className="space-y-1">
        {user?.role === Roles.HR_ADMIN && <NavLink to="/hr" className={linkClass}>HR Dashboard</NavLink>}
        {user?.role === Roles.INFRA_ADMIN && <NavLink to="/infra" className={linkClass}>Infra Dashboard</NavLink>}
        {user?.role === Roles.DEPARTMENT_ADMIN && (
          <NavLink to="/department" className={linkClass}>Department Dashboard</NavLink>
        )}
        {user?.role === Roles.CISO && <NavLink to="/ciso" className={linkClass}>CISO Dashboard</NavLink>}
        {user && (
          <>
            <NavLink to="/audit" className={linkClass}>Audit Logs</NavLink>
          </>
        )}
      </nav>

      {user && (
        <button
          className="mt-6 w-full rounded bg-slate-900 px-3 py-2 text-sm text-white"
          onClick={logout}
        >
          Logout
        </button>
      )}
    </aside>
  );
}

