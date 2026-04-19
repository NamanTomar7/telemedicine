import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", role: "patient" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login({ name: res.data.name, role: res.data.role, id: res.data.id }, res.data.access_token);
      const dest = res.data.role === "doctor" ? "/doctor" : res.data.role === "admin" ? "/admin" : "/patient";
      navigate(dest);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e8eef6 0%, #f4f7fb 100%)" }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "0 20px" }}>
        <div className="card" style={{ padding: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚕️</div>
            <h1 style={{ fontSize: "22px", marginBottom: "6px" }}>Welcome back</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Sign in to MediConnect</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Sign in as</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "15px" }} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
            New patient?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: "500" }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}