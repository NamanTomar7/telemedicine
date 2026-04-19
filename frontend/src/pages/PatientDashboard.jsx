import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("appointments");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [booking, setBooking] = useState({ doctor_id: "", date_time: "", reason: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    api.get("/doctors/").then(r => setDoctors(r.data));
    api.get("/appointments/my").then(r => setAppointments(r.data));
    if (user?.id) api.get(`/prescriptions/patient/${user.id}`).then(r => setPrescriptions(r.data));
  }, [user]);

  const bookAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/appointments/book", booking);
      setMessage({ type: "success", text: "Appointment booked successfully!" });
      setBooking({ doctor_id: "", date_time: "", reason: "" });
      const res = await api.get("/appointments/my");
      setAppointments(res.data);
      setTab("appointments");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Booking failed." });
    }
  };

  const canJoinCall = (appt) => {
    const apptTime = new Date(appt.date_time);
    const now = new Date();
    const diff = Math.abs(now - apptTime) / 60000;
    return appt.status === "confirmed" && diff <= 30;
  };

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
          <h1>Patient Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "28px" }}>
        <div className="stat-card">
          <p className="stat-label">Total Appointments</p>
          <p className="stat-value">{appointments.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Confirmed</p>
          <p className="stat-value">{appointments.filter(a => a.status === "confirmed").length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Prescriptions</p>
          <p className="stat-value">{prescriptions.length}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "var(--surface)", padding: "6px", borderRadius: "10px", border: "1px solid var(--border)", width: "fit-content" }}>
        <button style={tabStyle("appointments")} onClick={() => setTab("appointments")}>My Appointments</button>
        <button style={tabStyle("book")} onClick={() => setTab("book")}>Book Appointment</button>
        <button style={tabStyle("prescriptions")} onClick={() => setTab("prescriptions")}>Prescriptions</button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: "16px" }}>
          {message.text}
          <button onClick={() => setMessage({ type: "", text: "" })} style={{ float: "right", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>×</button>
        </div>
      )}

      {tab === "appointments" && (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px" }}>Your Appointments</h3>
          </div>
          {appointments.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📅</div>
              <p>No appointments yet. Book one with a doctor.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: "500", color: "var(--text-primary)" }}>{appt.doctor_name}</td>
                    <td>{appt.doctor_specialization}</td>
                    <td>{new Date(appt.date_time).toLocaleString()}</td>
                    <td>{appt.reason || "—"}</td>
                    <td><span className={`badge badge-${appt.status}`}>{appt.status}</span></td>
                    <td>
                      {canJoinCall(appt) && (
                        <button className="btn btn-accent" style={{ padding: "6px 14px", fontSize: "13px" }}
                          onClick={() => navigate(`/call/${appt.id}`)}>
                          Join Call
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "book" && (
        <div className="card" style={{ maxWidth: "560px" }}>
          <h3 style={{ marginBottom: "24px", fontSize: "16px" }}>Book an Appointment</h3>
          <form onSubmit={bookAppointment}>
            <div className="form-group">
              <label>Select Doctor</label>
              <select value={booking.doctor_id} onChange={e => setBooking({ ...booking, doctor_id: e.target.value })} required>
                <option value="">Choose a doctor...</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} — {doc.specialization}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date & Time</label>
              <input type="datetime-local" value={booking.date_time}
                onChange={e => setBooking({ ...booking, date_time: e.target.value })} required
                min={new Date().toISOString().slice(0, 16)} />
            </div>
            <div className="form-group">
              <label>Reason for Visit (optional)</label>
              <textarea rows={3} placeholder="Describe your symptoms..." value={booking.reason}
                onChange={e => setBooking({ ...booking, reason: e.target.value })}
                style={{ resize: "vertical" }} />
            </div>
            <button type="submit" className="btn btn-primary">Confirm Booking</button>
          </form>
        </div>
      )}

      {tab === "prescriptions" && (
        <div>
          {prescriptions.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>💊</div>
              <p>No prescriptions yet.</p>
            </div>
          ) : (
            <div className="grid-2">
              {prescriptions.map(rx => (
                <div className="card" key={rx.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", marginBottom: "4px" }}>Dr. {rx.doctor_name}</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{new Date(rx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontSize: "24px" }}>📋</span>
                  </div>
                  {rx.diagnosis && <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}><strong>Diagnosis:</strong> {rx.diagnosis}</p>}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Medicines</p>
                    {rx.medicines.map((med, i) => (
                      <div key={i} style={{ background: "var(--surface-2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px" }}>
                        <p style={{ fontWeight: "500", fontSize: "14px" }}>{med.name}</p>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{med.dosage} · {med.duration}</p>
                        {med.instructions && <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{med.instructions}</p>}
                      </div>
                    ))}
                  </div>
                  {rx.notes && <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "10px" }}><strong>Notes:</strong> {rx.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}