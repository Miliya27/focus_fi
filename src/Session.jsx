import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";

function Session() {
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [userAActive, setUserAActive] = useState(true);
  const [userBActive, setUserBActive] = useState(true);

  useEffect(() => {
    const roomRef = ref(database, "rooms/demoRoom");

    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTimer(data.timer);
        setRunning(data.running);
        setUserAActive(data.userA_active);
        setUserBActive(data.userB_active);
      }
    });
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Focus Session</h1>

      <h2>{formatTime()}</h2>

      <p>Status: {running ? "Running" : "Paused"}</p>

      <hr />

      <p>User A: {userAActive ? "🟢 Active" : "🔴 Inactive"}</p>
      <p>User B: {userBActive ? "🟢 Active" : "🔴 Inactive"}</p>
    </div>
  );
}

export default Session;