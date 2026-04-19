import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

export default function Prescription() {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patient_id");
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "", instructions: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", duration: "", instructions: "" }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMed = (i, field, val) => setMedicines(medicines.map((m, idx) => idx === i ? { ...m, [field]: val } : m));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/prescriptions/create", {
        appointment_id: appointmentId,
        patient_id: patientId,
        medicines: medicines.filter(m => m.name),
        diagnosis,
        notes
      });
      navigate("/doctor");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit prescription.");
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "700px" }}>
      <div className="page-header">
        <div>
          <h1>Write Prescription</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Post-call prescription for the patient</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "15px", marginBottom: "20px" }}>Clinical Details</h3>
          <div className="form-group">
            <label>Diagnosis</label>
            <input type="text" placeholder="e.g. Upper respiratory tract infection" value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Additional Notes</label>
            <textarea rows={3} placeholder="Rest, dietary advice, follow-up date..." value={notes}
              onChange={e => setNotes(e.target.value)} style={{ resize: "vertical" }} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px" }}>Medicines</h3>
            <button type="button" className="btn btn-outline" style={{ fontSize: "13px", padding: "6px 14px" }} onClick={addMedicine}>
              + Add Medicine
            </button>
          </div>

          {medicines.map((med, i) => (
            <div key={i} style={{ background: "var(--surface-2)", borderRadius: "10px", padding: "16px", marginBottom: "12px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Medicine {i + 1}</span>
                {medicines.length > 1 && (
                  <button type="button" onClick={() => removeMedicine(i)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "16px" }}>×</button>
                )}
              </div>
              <div className="grid-2" style={{ gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label>Medicine Name *</label>
                  <input type="text" placeholder="e.g. Amoxicillin 500mg" value={med.name}
                    onChange={e => updateMed(i, "name", e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label>Dosage *</label>
                  <input type="text" placeholder="e.g. 1 tablet twice daily" value={med.dosage}
                    onChange={e => updateMed(i, "dosage", e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Duration *</label>
                  <input type="text" placeholder="e.g. 7 days" value={med.duration}
                    onChange={e => updateMed(i, "duration", e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Instructions</label>
                  <input type="text" placeholder="e.g. Take after meals" value={med.instructions}
                    onChange={e => updateMed(i, "instructions", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "15px" }} disabled={loading}>
          {loading ? "Submitting..." : "✅ Submit Prescription"}
        </button>
      </form>
    </div>
  );
}