import { useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, update, get } from "firebase/database";

function App() {
  useEffect(() => {

    const roomRef = ref(db, "rooms/demoRoom");

    const params = new URLSearchParams(window.location.search);
    const role =
      params.get("role") === "B"
        ? "userB_active"
        : "userA_active";

    console.log("My role:", role);

    let timerInterval = null;

    // ⭐ ONLY USER A CAN CONTROL TIMER
    const isController = role === "userA_active";

    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const shouldRun =
        data.userA_active && data.userB_active;

      // controller updates running state
      if (isController) {
        if (data.running !== shouldRun) {
          update(roomRef, { running: shouldRun });
        }

        // START TIMER (only once)
        if (shouldRun && !timerInterval) {
          console.log("Timer started");

          timerInterval = setInterval(async () => {
            const snap = await get(roomRef);
            const latest = snap.val();

            if (!latest.running) return;

            update(roomRef, {
              timer: (latest.timer || 0) + 1,
            });
          }, 1000);
        }

        // STOP TIMER
        if (!shouldRun && timerInterval) {
          console.log("Timer stopped");
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
    });

    // tab visibility detection
    const handleVisibility = () => {
      const isActive =
        document.visibilityState === "visible";

      update(roomRef, {
        [role]: isActive,
      });

      console.log("Tab active:", isActive);
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
    };

  }, []);

  return <h1>Focus-Fi Backend Running 🚀</h1>;
}

export default App;