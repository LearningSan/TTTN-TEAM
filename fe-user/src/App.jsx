import { AnimatePresence } from "framer-motion";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login"; // Đảm bảo đường dẫn này đúng với file Login của bạn
import Register from "./pages/Register";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgetPassword";
import ConcertDetail from "./pages/ConcertDetail";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

import LoginButton from "./pages/nhap";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Trang Nhap */}
        <Route path="/nhap" element={<LoginButton />} />
        {/* Trang Home */}
        <Route path="/" element={<Home />} />
        {/* Trang Login */}
        <Route path="/login" element={<Login />} />
        {/* Trang Register */}
        <Route path="/register" element={<Register />} />
        {/* Trang Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Trang Concert Detail */}
        <Route path="/concert/:id" element={<ConcertDetail />} />
        {/* Trang Seat Selection */}
        <Route
          path="/concert/:concertId/zone/:zoneId"
          element={<SeatSelection />}
        />
        {/* Trang Checkout */}
        <Route path="/checkout" element={<Checkout />} />
        {/* Trang Order Success */}
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
      </Routes>
    </AnimatePresence>
  );
}
function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
