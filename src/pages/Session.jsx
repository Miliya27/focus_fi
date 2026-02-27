import { useEffect, useState } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../firebase";

function Session() {
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [userAActive, setUserAActive] = useState(true);
  const [userBActive, setUserBActive] = useState(true);

  useEffect(() => {
    const roomRef = ref(db, "rooms/demoRoom");

    const params = new URLSearchParams(window.location.search);
    const role =
      params.get("role") === "B"
        ? "userB_active"
        : "userA_active";

    const isController = role === "userA_active";

    let timerInterval = null;

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setTimer(data.timer || 0);
      setRunning(data.running);
      setUserAActive(data.userA_active);
      setUserBActive(data.userB_active);

      const shouldRun =
        data.userA_active && data.userB_active;

      if (isController) {
        if (data.running !== shouldRun) {
          update(roomRef, { running: shouldRun });
        }

        if (shouldRun && !timerInterval) {
          timerInterval = setInterval(async () => {
            const snap = await get(roomRef);
            const latest = snap.val();

            if (!latest.running) return;

            update(roomRef, {
              timer: (latest.timer || 0) + 1,
            });
          }, 1000);
        }

        if (!shouldRun && timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
    });

    const handleVisibility = () => {
      const isActive =
        document.visibilityState === "visible";

      update(roomRef, {
        [role]: isActive,
      });
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    handleVisibility();

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      if (timerInterval) clearInterval(timerInterval);
      unsubscribe();
    };
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EEF2ED",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#DDE3DC",
          padding: "40px 30px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <h1
          style={{
            color: "#2F3A34",
            fontWeight: 600,
            marginBottom: "30px",
          }}
        >
          Focus Session
        </h1>

        <h2
          style={{
            fontSize: "48px",
            color: "#6F916F",
            fontWeight: 600,
            marginBottom: "10px",
          }}
        >
          {formatTime()}
        </h2>

        <p
          style={{
            color: running ? "#6F916F" : "#8A9A8F",
            fontWeight: 500,
            marginBottom: "30px",
          }}
        >
          {running ? "Session Running" : "Session Paused"}
        </p>

        <div
          style={{
            background: "#EEF2ED",
            padding: "20px",
            borderRadius: "18px",
            fontSize: "14px",
            color: "#2F3A34",
          }}
        >
          <p style={{ margin: "8px 0" }}>
            User A: {userAActive ? "🟢 Active" : "🔴 Inactive"}
          </p>
          <p style={{ margin: "8px 0" }}>
            User B: {userBActive ? "🟢 Active" : "🔴 Inactive"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Session;