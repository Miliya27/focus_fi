import { useEffect, useState, useRef } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../firebase";

function Session() {
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [userAActive, setUserAActive] = useState(true);
  const [userBActive, setUserBActive] = useState(true);

  const intervalRef = useRef(null);

  useEffect(() => {
    const roomRef = ref(db, "rooms/demoRoom");

    const params = new URLSearchParams(window.location.search);
    const role =
      params.get("role") === "B"
        ? "userB_active"
        : "userA_active";

    const isController = role === "userA_active";

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

        // START TIMER
        if (shouldRun && !intervalRef.current) {
          intervalRef.current = setInterval(async () => {
            const snap = await get(roomRef);
            const latest = snap.val();

            if (!latest.running) return;

            update(roomRef, {
              timer: (latest.timer || 0) + 1,
            });
          }, 1000);
        }

        // STOP TIMER
        if (!shouldRun && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
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

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      unsubscribe();
    };
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Focus Session</h1>

      <h2 style={{ fontSize: "48px" }}>{formatTime()}</h2>

      <p style={{ color: running ? "green" : "red" }}>
        Status: {running ? "Running" : "Paused"}
      </p>

      <hr />

      <p>
        User A: {userAActive ? "🟢 Active" : "🔴 Inactive"}
      </p>

      <p>
        User B: {userBActive ? "🟢 Active" : "🔴 Inactive"}
      </p>

      {(!userAActive || !userBActive) && (
        <h3 style={{ color: "red" }}>
          ⚠ Someone switched tabs!
        </h3>
      )}
    </div>
  );
}

export default Session;