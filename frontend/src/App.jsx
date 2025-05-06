import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthCard from "./components/Auth/AuthCard";
import VerifyEmailPage from "./components/Auth/VerifyEmailPage";
import StorePage from "./components/Store/StorePage";


function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect to /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Routes */}
        <Route path="/login" element={<AuthCard initialMode="login" />} />
        <Route path="/register" element={<AuthCard initialMode="register" />} />
        <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
        <Route path="/reset-password/:token" element={<div>Reset Password Page</div>} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* Store Page */}
        <Route path="/store" element={<StorePage />} />

      </Routes>
    </Router>
  );
}

export default App;
