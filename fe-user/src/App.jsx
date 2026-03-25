import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; // Đảm bảo đường dẫn này đúng với file Login của bạn
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang mặc định (Home) */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                <h1 className="text-4xl font-black text-blue-500 uppercase italic">
                  Trang Chủ demo
                </h1>
                <a href="/login" className="text-blue-600 underline mt-4 block">
                  Đi đến trang Login
                </a>
                <a
                  href="/register"
                  className="text-blue-600 underline mt-2 block"
                >
                  Đi đến trang Register
                </a>
              </div>
            </div>
          }
        />

        {/* Trang Login */}
        <Route path="/login" element={<Login />} />
        {/* Trang Register */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
