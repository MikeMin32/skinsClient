import { NavLink, Outlet } from "react-router-dom";

const baseLink: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  color: "rgba(255,255,255,0.8)",
  border: "1px solid transparent",
};

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  ...baseLink,
  color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
  background: isActive ? "rgba(59,130,246,0.18)" : "transparent",
  borderColor: isActive ? "rgba(59,130,246,0.35)" : "transparent",
});

export default function AppLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        margin: 0,
        background: "#0b1220",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          height: 64,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(11,18,32,0.92)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.2 }}>
              SkinsClient
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
              Private area
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
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

          {/* Right side */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              Logged in (stub)
            </div>

            <button
              style={{
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                padding: "10px 12px",
                cursor: "pointer",
              }}
              onClick={() => alert("Later: logout")}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main style={{ flex: 1 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px",
          }}
        >
          {/* Content card */}
          <div
            style={{
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              padding: 16,
              minHeight: "calc(100vh - 64px - 32px)",
            }}
          >
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer (optional, small) */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 16px",
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
        }}
      >
        <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
          SkinsClient • MVP
        </div>
      </footer>
    </div>
  );
}
