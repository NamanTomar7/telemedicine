import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = {
  nav: {
    background: "var(--primary)",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
    boxShadow: "0 2px 12px rgba(15,76,129,0.2)"
  },
  brand: {
    color: "white",
    fontFamily: "var(--font-heading)",
    fontSize: "18px",
    fontWeight: "700",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  right: { display: "flex", alignItems: "center", gap: "16px" },
  userName: { color: "rgba(255,255,255,0.85)", fontSize: "14px" },
  logoutBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "white",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "var(--font-body)"
  }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashLink = user?.role === "doctor" ? "/doctor" : user?.role === "admin" ? "/admin" : "/patient";

  return (
    <nav style={styles.nav}>
      <Link to={user ? dashLink : "/"} style={styles.brand}>
        ⚕ MediConnect
      </Link>
      {user && (
        <div style={styles.right}>
          <span style={styles.userName}>👋 {user.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}