import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireRole } from "./routing/RequireRole";
import { Roles } from "./routing/roles";
import { useAuth } from "./routing/AuthContext";
import { HrDashboard } from "./pages/HrDashboard";
import { InfraDashboard } from "./pages/InfraDashboard";
import { DepartmentDashboard } from "./pages/DepartmentDashboard";
import { CisoDashboard } from "./pages/CisoDashboard";
import { AuditLogPage } from "./pages/AuditLogPage";

function LoginPage() {
  const { login } = useAuth();
  return (
    <div className="mx-auto mt-20 max-w-sm rounded border bg-white p-5">
      <h1 className="mb-4 text-lg font-semibold">AccessGuard Login</h1>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          await login(String(fd.get("email")), String(fd.get("password")));
        }}
      >
        <label className="block text-sm">
          Email
          <input name="email" className="mt-1 w-full rounded border px-2 py-1" />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </label>
        <button className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Sign in
        </button>
      </form>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="mx-auto mt-20 max-w-xl rounded border bg-white p-5">
      <div className="text-lg font-semibold">Unauthorized</div>
      <div className="text-sm text-slate-600">Your role cannot access this area.</div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role === Roles.HR_ADMIN ? "hr" : user.role === Roles.INFRA_ADMIN ? "infra" : user.role === Roles.DEPARTMENT_ADMIN ? "department" : user.role === Roles.CISO ? "ciso" : "me"}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/hr"
        element={
          <RequireRole roles={[Roles.HR_ADMIN]}>
            <AppLayout>
              <HrDashboard />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/infra"
        element={
          <RequireRole roles={[Roles.INFRA_ADMIN]}>
            <AppLayout>
              <InfraDashboard />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/department"
        element={
          <RequireRole roles={[Roles.DEPARTMENT_ADMIN]}>
            <AppLayout>
              <DepartmentDashboard />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/ciso"
        element={
          <RequireRole roles={[Roles.CISO]}>
            <AppLayout>
              <CisoDashboard />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/audit"
        element={
          <RequireRole roles={[Roles.CISO, Roles.HR_ADMIN, Roles.INFRA_ADMIN, Roles.DEPARTMENT_ADMIN]}>
            <AppLayout>
              <AuditLogPage />
            </AppLayout>
          </RequireRole>
        }
      />
    </Routes>
  );
}
