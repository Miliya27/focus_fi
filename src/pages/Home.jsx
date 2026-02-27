import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, set, get } from "firebase/database";
import { db } from "../firebase";

function Home() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  // 🔥 Create Room
  const createRoom = async () => {
    const newRoomCode = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    await set(ref(db, `rooms/${newRoomCode}`), {
      timer: 0,
      running: false,
      userA_active: true,
      userB_active: false,
    });

    // go to session as User A
    navigate(`/session?room=${newRoomCode}&role=A`);
  };

  // 🔥 Join Room
  const joinRoom = async () => {
    if (!roomCode) return alert("Enter room code");

    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      navigate(`/session?room=${roomCode}&role=B`);
    } else {
      alert("Room not found");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EEF2ED",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#2F3A34", fontSize: "60px" }}>FocusFi</h1>

        <button
          onClick={createRoom}
          style={{
            padding: "14px 30px",
            borderRadius: "12px",
            border: "none",
            background: "#2F3A34",
            color: "white",
            fontSize: "22px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Create Room
        </button>

        <br />

        <input
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            marginRight: "10px",
            fontSize: "16px",
          }}
        />

        <button
          onClick={joinRoom}
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#6F916F",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default Home;