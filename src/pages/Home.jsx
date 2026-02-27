import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  return (
    <div>
      <h1>FocusFi</h1>

      <button onClick={() => navigate("/room")}>
        Create Room
      </button>

      <br /><br />

      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />

      <button onClick={() => navigate("/room")}>
        Join Room
      </button>
    </div>
  );
}

export default Home;