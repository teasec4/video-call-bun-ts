import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { RoomPage } from "./pages/RoomPage";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import { TestPage } from "./pages/TestPage";

export function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/*<Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />*/}
          <Route path="/" element={<TestPage/> }/>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
