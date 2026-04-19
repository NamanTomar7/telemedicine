import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function VideoCall() {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patient_id");
  const { user } = useAuth();
  const navigate = useNavigate();

  const clientRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const joinedRef = useRef(false);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [error, setError] = useState("");

  const joinCall = useCallback(async () => {
    if (joinedRef.current) return;
    try {
      setStatus("Fetching token...");
      const res = await api.get(`/agora/token/${appointmentId}`);
      const { token, app_id, channel } = res.data;

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      // When remote user publishes
      client.on("user-published", async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);

        if (mediaType === "video") {
          setRemoteJoined(true);
          // Play remote video in the remote container only
          const remoteContainer = document.getElementById("remote-video-container");
          if (remoteContainer) {
            remoteUser.videoTrack.play(remoteContainer);
          }
        }
        if (mediaType === "audio") {
          remoteUser.audioTrack.play();
        }
      });

      client.on("user-unpublished", (remoteUser, mediaType) => {
        if (mediaType === "video") {
          setRemoteJoined(false);
        }
      });

      client.on("user-left", () => {
        setRemoteJoined(false);
      });

      setStatus("Joining channel...");
      await client.join(app_id, channel, token, null);
      joinedRef.current = true;

      setStatus("Starting camera...");
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      localAudioTrackRef.current = audioTrack;
      localVideoTrackRef.current = videoTrack;

      // Play local video ONLY in the local container
      const localContainer = document.getElementById("local-video-container");
      if (localContainer) {
        videoTrack.play(localContainer);
      }

      await client.publish([audioTrack, videoTrack]);
      setStatus("Connected");

    } catch (err) {
      console.error("Call error:", err);
      setError("Failed to join: " + (err.message || "Check camera/mic permissions"));
      setStatus("Failed");
    }
  }, [appointmentId]);

  useEffect(() => {
    joinCall();
    return () => { cleanup(false); };
  }, [joinCall]);

  const cleanup = async (shouldNavigate = true) => {
    try {
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
      joinedRef.current = false;
    } catch (e) {
      console.error("Cleanup error:", e);
    }
    if (shouldNavigate) {
      if (user?.role === "doctor") {
        navigate(`/prescription/${appointmentId}?patient_id=${patientId}`);
      } else {
        navigate("/patient");
      }
    }
  };

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      const newState = !micOn;
      await localAudioTrackRef.current.setEnabled(newState);
      setMicOn(newState);
    }
  };

  const toggleCam = async () => {
    if (localVideoTrackRef.current) {
      const newState = !camOn;
      await localVideoTrackRef.current.setEnabled(newState);
      setCamOn(newState);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: "#0d1b2a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>

      {status !== "Connected" && !error && (
        <div style={{
          background: "rgba(255,255,255,0.1)",
          color: "white",
          padding: "8px 20px",
          borderRadius: "20px",
          fontSize: "13px",
          marginBottom: "16px"
        }}>
          ⏳ {status}
        </div>
      )}

      {error && (
        <div style={{
          background: "#ef476f22",
          border: "1px solid #ef476f",
          color: "#ef476f",
          padding: "12px 20px",
          borderRadius: "8px",
          marginBottom: "16px",
          maxWidth: "500px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        width: "100%",
        maxWidth: "900px",
        marginBottom: "24px"
      }}>

        {/* LOCAL video box */}
        <div style={{
          position: "relative",
          background: "#1a2942",
          borderRadius: "12px",
          overflow: "hidden",
          aspectRatio: "16/9"
        }}>
          <div
            id="local-video-container"
            style={{ width: "100%", height: "100%" }}
          />
          {!camOn && (
            <div style={{
              position: "absolute", inset: 0,
              background: "#1a2942",
              display: "flex", alignItems: "center",
              justifyContent: "center", flexDirection: "column", gap: "8px"
            }}>
              <div style={{ fontSize: "36px" }}>👤</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>Camera off</p>
            </div>
          )}
          <div style={{
            position: "absolute", bottom: "10px", left: "12px",
            background: "rgba(0,0,0,0.6)", color: "white",
            fontSize: "12px", padding: "4px 10px", borderRadius: "6px"
          }}>
            You {!micOn && "🔇"}
          </div>
        </div>

        {/* REMOTE video box */}
        <div style={{
          position: "relative",
          background: "#1a2942",
          borderRadius: "12px",
          overflow: "hidden",
          aspectRatio: "16/9"
        }}>
          <div
            id="remote-video-container"
            style={{ width: "100%", height: "100%" }}
          />
          {!remoteJoined && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center",
              justifyContent: "center", flexDirection: "column", gap: "8px"
            }}>
              <div style={{ fontSize: "36px" }}>👤</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                Waiting for {user?.role === "doctor" ? "patient" : "doctor"}...
              </p>
            </div>
          )}
          <div style={{
            position: "absolute", bottom: "10px", left: "12px",
            background: "rgba(0,0,0,0.6)", color: "white",
            fontSize: "12px", padding: "4px 10px", borderRadius: "6px"
          }}>
            {user?.role === "doctor" ? "Patient" : "Doctor"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button onClick={toggleMic} style={{
          background: micOn ? "rgba(255,255,255,0.15)" : "#ef476f",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white", padding: "12px 20px", borderRadius: "10px",
          cursor: "pointer", fontSize: "14px",
          fontFamily: "var(--font-body)", fontWeight: "500",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          {micOn ? "🎙 Mute" : "🔇 Unmute"}
        </button>

        <button onClick={toggleCam} style={{
          background: camOn ? "rgba(255,255,255,0.15)" : "#ef476f",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white", padding: "12px 20px", borderRadius: "10px",
          cursor: "pointer", fontSize: "14px",
          fontFamily: "var(--font-body)", fontWeight: "500",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          {camOn ? "📹 Stop Video" : "🚫 Start Video"}
        </button>

        <button onClick={() => cleanup(true)} style={{
          background: "#ef476f", border: "none",
          color: "white", padding: "12px 28px", borderRadius: "10px",
          cursor: "pointer", fontSize: "14px",
          fontFamily: "var(--font-body)", fontWeight: "600",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          📴 End Call
        </button>
      </div>
    </div>
  );
}