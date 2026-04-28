import { AnimatePresence } from "framer-motion";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import MainLayout from "./components/MainLayout"; // Đảm bảo đường dẫn này đúng

// Import các trang của bạn
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import ConcertDetail from "./pages/ConcertDetail";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyTicket from "./pages/MyTicket";
import Payment from "./pages/Payment";
import ProfilePage from "./pages/Profile";
import ResaleMarket from "./pages/ResaleMarket";
import Selection from "./pages/Selection";

import LoginButton from "./pages/nhap";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* NHÓM 1: Các trang dùng Header chung */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/concert/:id" element={<ConcertDetail />} />
          <Route path="/concert/:id/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId?" element={<OrderSuccess />} />
          <Route path="/my-tickets" element={<MyTicket />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resale-market" element={<ResaleMarket />} />
        </Route>

        {/* NHÓM 2: Các trang KHÔNG dùng Header (Login/Register/Quên mật khẩu) */}
        <Route path="/concert/:id/selection" element={<Selection />} />
        <Route path="/payment" element={<Payment />} />
        <Route
          path="/concert/:concertId/zone/:zoneId"
          element={<SeatSelection />}
        />
        <Route path="/nhap" element={<LoginButton />} />
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
