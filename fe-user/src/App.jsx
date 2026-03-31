import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; // Đảm bảo đường dẫn này đúng với file Login của bạn
import Register from "./pages/Register";
import Home from "./pages/Home";
function App() {
  return (
    <Router>
      <Routes>
        {/* Trang Home */}
        <Route path="/" element={<Home />} />
        {/* Trang Login */}
        <Route path="/login" element={<Login />} />
        {/* Trang Register */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
