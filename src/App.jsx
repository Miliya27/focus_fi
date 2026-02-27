import { useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, update } from "firebase/database";

function App() {

  useEffect(() => {

    const roomRef = ref(db, "rooms/demoRoom");

    // 🔥 listen to room changes
    onValue(roomRef, (snapshot) => {

      const data = snapshot.val();
      if (!data) return;

      console.log("Firebase Data:", data);

      // ⭐ check both users
      const shouldRun =
        data.userA_active && data.userB_active;

      update(roomRef, {
        running: shouldRun
      });

    });

    // 🔥 detect tab change
    const handleVisibility = () => {
      const isActive =
        document.visibilityState === "visible";

      update(roomRef, {
        userA_active: isActive
      });

      console.log("Tab active:", isActive);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };

  }, []);

  return <h1>Focus-Fi Backend Running 🚀</h1>;
}

export default App;