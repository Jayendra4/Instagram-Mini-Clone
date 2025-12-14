import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", formData);

      if (!response || !response.token) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      try {
        await api.get("/auth/me");
        window.location.href = "/";
      } catch (verifyErr) {
        console.error("Token verification failed:", verifyErr);
        setError("Authentication failed. Please try again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      if (err?.message && err.message !== "Network Error" && !err.message.includes("timeout")) {
        setError(err.message);
      } else if (!err?.status) {
        setError(
          "Network error: Unable to reach the server. Make sure the backend is running on http://localhost:5000"
        );
      } else {
        setError(
          "Login failed. Please check your email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="hidden md:flex justify-center">
          <div className="relative w-[320px] h-[640px] rounded-[32px] bg-black/5 border border-insta-border overflow-hidden">
            <div className="absolute inset-4 rounded-[24px] bg-gradient-to-b from-white to-[#f0f0f0] flex items-center justify-center text-sm text-insta-muted">
              Instagram preview
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-insta-border rounded-sm px-12 py-10 flex flex-col items-center insta-card">
            <h1 className="text-5xl font-logo text-[#262626] mb-8">Instagram</h1>

            <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Phone number, username, or email"
                value={formData.email}
                onChange={handleChange}
                className="bg-[#fafafa] border border-insta-border text-sm rounded-sm focus:border-gray-400 outline-none w-full px-3 py-2"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="bg-[#fafafa] border border-insta-border text-sm rounded-sm focus:border-gray-400 outline-none w-full px-3 py-2"
                required
              />

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`mt-2 flex h-9 items-center justify-center rounded-lg text-sm font-semibold text-white transition
                  ${loading || !isFormValid ? "bg-[#b2dffc] cursor-not-allowed" : "bg-[#0095f6] hover:bg-[#1877f2]"}`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Log in"}
              </button>
            </form>

            {error && (
              <p className="text-red-500 text-sm mt-4 text-center leading-tight">{error}</p>
            )}

            <div className="flex items-center w-full my-6">
              <div className="h-px bg-insta-border flex-1" />
              <span className="px-4 text-xs font-semibold text-insta-muted">OR</span>
              <div className="h-px bg-insta-border flex-1" />
            </div>

            <Link to="/forgot-password" className="text-xs text-[#00376b] hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="bg-white border border-insta-border rounded-sm py-5 text-center mt-4">
            <span className="text-sm text-[#262626]">Don&apos;t have an account? </span>
            <Link to="/signup" className="text-[#0095f6] font-semibold text-sm hover:text-[#1877f2]">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;