import { useEffect, useState } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../firebase";

function Session() {
  // UI states (from your friend)
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [userAActive, setUserAActive] = useState(true);
  const [userBActive, setUserBActive] = useState(true);

  useEffect(() => {

    const roomRef = ref(database, "rooms/demoRoom");

    // role from URL
    const params = new URLSearchParams(window.location.search);
    const role =
      params.get("role") === "B"
        ? "userB_active"
        : "userA_active";

    const isController = role === "userA_active";

    let timerInterval = null;

    // 🔥 realtime listener
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // UI updates
      setTimer(data.timer || 0);
      setRunning(data.running);
      setUserAActive(data.userA_active);
      setUserBActive(data.userB_active);

      const shouldRun =
        data.userA_active && data.userB_active;

      // ONLY controller handles timer logic
      if (isController) {

        if (data.running !== shouldRun) {
          update(roomRef, { running: shouldRun });
        }

        // start timer
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

        // stop timer
        if (!shouldRun && timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
    });

    // tab visibility tracking
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

  // UI helper
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