import { NavLink, Outlet } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 8,
  textDecoration: "none",
  color: isActive ? "#fff" : "#ddd",
  background: isActive ? "#3b82f6" : "transparent",
});

export function AppLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#0b1220" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          padding: 16,
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
            SkinsClient
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            Private area
          </div>
        </div>

        <nav style={{ display: "grid", gap: 8 }}>
          <NavLink to="/app/dashboard" style={linkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/app/inventory" style={linkStyle}>
            Inventory
          </NavLink>
          <NavLink to="/app/valuation" style={linkStyle}>
            Valuation
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
            SkinsClient • App
          </div>

          <button
            style={{
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "8px 12px",
              cursor: "pointer",
            }}
            onClick={() => alert("Later: logout")}
          >
            Logout
          </button>
        </header>

        {/* Content */}
        <main style={{ padding: 16 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
