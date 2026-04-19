import { useState, useEffect } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState("overview");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then(r => setStats(r.data));
    api.get("/admin/doctors").then(r => setDoctors(r.data));
    api.get("/admin/patients").then(r => setPatients(r.data));
    api.get("/admin/appointments").then(r => setAppointments(r.data));
  }, []);

  const tabStyle = (t) => ({
    padding: "8px 20px",
    border: "none",
    background: tab === t ? "var(--primary)" : "transparent",
    color: tab === t ? "white" : "var(--text-secondary)",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s"
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Platform overview</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: "28px" }}>
        <div className="stat-card">
          <p className="stat-label">Total Doctors</p>
          <p className="stat-value">{stats.total_doctors ?? "—"}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Patients</p>
          <p className="stat-value">{stats.total_patients ?? "—"}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Appointments</p>
          <p className="stat-value">{stats.total_appointments ?? "—"}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Prescriptions</p>
          <p className="stat-value">{stats.total_prescriptions ?? "—"}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "var(--surface)", padding: "6px", borderRadius: "10px", border: "1px solid var(--border)", width: "fit-content" }}>
        <button style={tabStyle("doctors")} onClick={() => setTab("doctors")}>Doctors</button>
        <button style={tabStyle("patients")} onClick={() => setTab("patients")}>Patients</button>
        <button style={tabStyle("appointments")} onClick={() => setTab("appointments")}>Appointments</button>
      </div>

      {tab === "doctors" && (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px" }}>Registered Doctors</h3>
          </div>
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Specialization</th><th>Qualifications</th><th>Experience</th></tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: "500", color: "var(--text-primary)" }}>{doc.name}</td>
                  <td>{doc.email}</td>
                  <td>{doc.specialization}</td>
                  <td>{doc.qualifications}</td>
                  <td>{doc.experience_years} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "patients" && (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px" }}>Registered Patients</h3>
          </div>
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th></tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: "500", color: "var(--text-primary)" }}>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "appointments" && (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px" }}>All Appointments</h3>
          </div>
          <table>
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Reason</th><th>Status</th></tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: "500", color: "var(--text-primary)" }}>{a.patient_name}</td>
                  <td>{a.doctor_name}</td>
                  <td>{new Date(a.date_time).toLocaleString()}</td>
                  <td>{a.reason || "—"}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}