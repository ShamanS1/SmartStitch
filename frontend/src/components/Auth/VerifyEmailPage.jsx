import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call backend to verify the code/token
      await axios.get(`http://localhost:5000/api/auth/verify-email/${code || token}`);
      setMessage("Email verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Invalid or expired code.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="border px-4 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          Verify
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}