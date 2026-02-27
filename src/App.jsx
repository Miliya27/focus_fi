import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue, update, get } from "firebase/database";

function App() {

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {

    const roomRef = ref(db, "rooms/demoRoom");
    let timerInterval = null;

    // ⭐ Assign role
    const assignRole = async () => {

      const snapshot = await get(roomRef);
      const data = snapshot.val();

      if (!data.userA_taken) {
        await update(roomRef, { userA_taken: true });
        setUserRole("userA_active");
        console.log("You are User A");
      } else {
        await update(roomRef, { userB_taken: true });
        setUserRole("userB_active");
        console.log("You are User B");
      }
    };

    assignRole();

    // ⭐ Listen realtime
    const unsubscribe = onValue(roomRef, (snapshot) => {

      const data = snapshot.val();
      if (!data) return;

      console.log("Firebase Data:", data);

      const shouldRun =
        data.userA_active && data.userB_active;

      if (data.running !== shouldRun) {
        update(roomRef, { running: shouldRun });
      }

      // ⭐ ONLY USER A controls timer
      if (userRole === "userA_active") {

        if (data.running && !timerInterval) {
          timerInterval = setInterval(() => {
            update(roomRef, {
              timer: data.timer + 1
            });
          }, 1000);
        }

        if (!data.running && timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }

    });

    // ⭐ tab visibility
    const handleVisibility = () => {

      if (!userRole) return;

      const isActive =
        document.visibilityState === "visible";

      update(roomRef, {
        [userRole]: isActive
      });

      console.log("Tab active:", isActive);
    };
    handleVisibility(); 
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
      clearInterval(timerInterval);
      unsubscribe();
    };

  }, [userRole]);

  return <h1>Focus-Fi Backend Running 🚀</h1>;
}

export default App;