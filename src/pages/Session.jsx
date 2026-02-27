import { useEffect, useState } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../firebase";

function Session() {
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [userAActive, setUserAActive] = useState(true);
  const [userBActive, setUserBActive] = useState(true);
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const code = params.get("room");
    setRoomCode(code);

    const role =
      params.get("role") === "B"
        ? "userB_active"
        : "userA_active";

    const isController = role === "userA_active";

    const roomRef = ref(db, `rooms/${code}`);

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

  // ⭐ COPY TO CLIPBOARD FUNCTION
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.log("Copy failed");
    }
  };

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
        fontFamily: "Poppins",
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
        {/* ROOM CODE + COPY BUTTON */}
        <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    fontWeight: "600",
    color: "#2F3A34",
  }}
>
  <span>Room Code: {roomCode}</span>

  <button
    onClick={copyRoomCode}
    style={{
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: "18px",
    }}
    title="Copy Room Code"
  >
    {copied ? "✔️" : "📋"}
  </button>
</div>
        <h1 style={{ color: "#2F3A34" }}>Focus Session</h1>

        <h2 style={{ fontSize: "48px", color: "#6F916F" }}>
          {formatTime()}
        </h2>

        <p>
          {running ? "Session Running" : "Session Paused"}
        </p>

        <hr />

        <p>
          User A: {userAActive ? "🟢 Active" : "🔴 Inactive"}
        </p>
        <p>
          User B: {userBActive ? "🟢 Active" : "🔴 Inactive"}
        </p>
      </div>
    </div>
  );
}

export default Session;