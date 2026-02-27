import { useNavigate } from "react-router-dom";

function Room() {
  const navigate = useNavigate();

  const startSession = () => {
    navigate("/session");
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#EEF2ED",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          background: "#DDE3DC",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          width: "350px",
        }}
      >
        <h1 style={{ color: "#2F3A34" }}>Room Ready</h1>

        <p style={{ color: "#6F916F" }}>
          Waiting for both users to join...
        </p>

        <button
          onClick={startSession}
          style={{
            marginTop: "20px",
            padding: "12px 25px",
            border: "none",
            borderRadius: "10px",
            background: "#6F916F",
            color: "white",
            cursor: "pointer",
          }}
        >
          Start Session
        </button>
      </div>
    </div>
  );
}

export default Room;