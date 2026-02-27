import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Room from "./pages/Room";
import Session from "./pages/Session";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
        <Route path="/session" element={<Session />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;